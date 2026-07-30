const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const app = require('../src/app');
const env = require('../src/config/env');
const notesRepository = require('../src/data-access/notes.repository');

chai.use(chaiHttp);
const { expect } = chai;

const AUTH_USER_ID = 1;
const authHeader = () => {
  const token = jwt.sign({ sub: AUTH_USER_ID, email: 'ada@example.com' }, env.jwtSecret, {
    expiresIn: '1h',
  });
  return `Bearer ${token}`;
};

const sampleNote = (overrides = {}) => ({
  id: 1,
  user_id: AUTH_USER_ID,
  title: 'Grocery list',
  content: { ops: [{ insert: 'Milk, eggs, bread\n' }] },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

afterEach(() => sinon.restore());

describe('Notes API — authentication requirement', () => {
  it('rejects every notes route without a Bearer token', async () => {
    const responses = await Promise.all([
      chai.request(app).get('/api/notes'),
      chai.request(app).post('/api/notes').send({ title: 'x', content: {} }),
      chai.request(app).get('/api/notes/1'),
      chai.request(app).put('/api/notes/1').send({ title: 'x' }),
      chai.request(app).delete('/api/notes/1'),
    ]);

    responses.forEach((res) => expect(res).to.have.status(401));
  });
});

describe('GET /api/notes', () => {
  it("returns only the authenticated user's notes", async () => {
    sinon.stub(notesRepository, 'findAllByUserId').resolves([sampleNote(), sampleNote({ id: 2 })]);

    const res = await chai.request(app).get('/api/notes').set('Authorization', authHeader());

    expect(res).to.have.status(200);
    expect(res.body.data.notes).to.have.length(2);
    expect(notesRepository.findAllByUserId.calledWith(AUTH_USER_ID)).to.be.true;
  });
});

describe('POST /api/notes', () => {
  it('creates a note and returns 201', async () => {
    sinon.stub(notesRepository, 'create').resolves(sampleNote());

    const res = await chai
      .request(app)
      .post('/api/notes')
      .set('Authorization', authHeader())
      .send({ title: 'Grocery list', content: { ops: [{ insert: 'Milk\n' }] } });

    expect(res).to.have.status(201);
    expect(res.body.data.note).to.include({ title: 'Grocery list' });
  });

  it('rejects a missing title with 400', async () => {
    const res = await chai
      .request(app)
      .post('/api/notes')
      .set('Authorization', authHeader())
      .send({ content: {} });

    expect(res).to.have.status(400);
    expect(res.body.details.errors).to.include('title is required');
  });

  it('rejects non-object content with 400', async () => {
    const res = await chai
      .request(app)
      .post('/api/notes')
      .set('Authorization', authHeader())
      .send({ title: 'x', content: 'not an object' });

    expect(res).to.have.status(400);
    expect(res.body.details.errors).to.include('content must be a JSON object');
  });
});

describe('GET /api/notes/:id', () => {
  it('returns the note when owned by the caller', async () => {
    sinon.stub(notesRepository, 'findByIdForUser').resolves(sampleNote());

    const res = await chai.request(app).get('/api/notes/1').set('Authorization', authHeader());

    expect(res).to.have.status(200);
    expect(res.body.data.note.id).to.equal(1);
  });

  it("returns 404 for a note that doesn't exist or isn't the caller's", async () => {
    sinon.stub(notesRepository, 'findByIdForUser').resolves(null);

    const res = await chai.request(app).get('/api/notes/999').set('Authorization', authHeader());

    expect(res).to.have.status(404);
  });

  it('returns 400 for a non-numeric id, without ever reaching the repository', async () => {
    const repoSpy = sinon.spy(notesRepository, 'findByIdForUser');

    const res = await chai
      .request(app)
      .get('/api/notes/not-a-number')
      .set('Authorization', authHeader());

    expect(res).to.have.status(400);
    expect(repoSpy.called).to.be.false;
  });
});

describe('PUT /api/notes/:id', () => {
  it('updates title and content together', async () => {
    sinon.stub(notesRepository, 'updateForUser').resolves(sampleNote({ title: 'Updated' }));

    const res = await chai
      .request(app)
      .put('/api/notes/1')
      .set('Authorization', authHeader())
      .send({ title: 'Updated', content: { ops: [{ insert: 'New\n' }] } });

    expect(res).to.have.status(200);
    expect(res.body.data.note.title).to.equal('Updated');
  });

  it('passes only the provided field through on a title-only update, leaving content undefined for COALESCE to preserve', async () => {
    const updateStub = sinon
      .stub(notesRepository, 'updateForUser')
      .resolves(sampleNote({ title: 'Renamed' }));
    const findSpy = sinon.spy(notesRepository, 'findByIdForUser');

    const res = await chai
      .request(app)
      .put('/api/notes/1')
      .set('Authorization', authHeader())
      .send({ title: 'Renamed' });

    expect(res).to.have.status(200);
    // No pre-read: the old read-then-merge approach had a race (another
    // request's concurrent update could land in the gap between the read
    // and the write, and get silently overwritten). The fix relies on
    // PostgreSQL's own COALESCE in a single atomic UPDATE instead, so
    // there should be no separate findByIdForUser call at all.
    expect(findSpy.called).to.be.false;
    expect(updateStub.calledWith(1, AUTH_USER_ID, { title: 'Renamed', content: undefined })).to.be
      .true;
  });

  it("returns 404 when updating a note that doesn't exist or isn't the caller's", async () => {
    sinon.stub(notesRepository, 'updateForUser').resolves(null);

    const res = await chai
      .request(app)
      .put('/api/notes/1')
      .set('Authorization', authHeader())
      .send({ title: 'Renamed' });

    expect(res).to.have.status(404);
  });

  it('rejects an empty body with 400', async () => {
    const res = await chai
      .request(app)
      .put('/api/notes/1')
      .set('Authorization', authHeader())
      .send({});

    expect(res).to.have.status(400);
  });
});

describe('DELETE /api/notes/:id', () => {
  it('deletes an owned note and returns 204', async () => {
    sinon.stub(notesRepository, 'deleteForUser').resolves(true);

    const res = await chai.request(app).delete('/api/notes/1').set('Authorization', authHeader());

    expect(res).to.have.status(204);
  });

  it("returns 404 for a note that doesn't exist or isn't the caller's", async () => {
    sinon.stub(notesRepository, 'deleteForUser').resolves(false);

    const res = await chai.request(app).delete('/api/notes/1').set('Authorization', authHeader());

    expect(res).to.have.status(404);
  });
});
