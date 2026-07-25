const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = require('../src/app');
const env = require('../src/config/env');
const usersRepository = require('../src/data-access/users.repository');

chai.use(chaiHttp);
const { expect } = chai;

describe('POST /api/auth/signup', () => {
  afterEach(() => sinon.restore());

  it('creates a user and returns a token, never leaking password_hash', async () => {
    sinon.stub(usersRepository, 'findByEmail').resolves(null);
    sinon.stub(usersRepository, 'createUser').resolves({
      id: 1,
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const res = await chai.request(app).post('/api/auth/signup').send({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'supersecret123',
    });

    expect(res).to.have.status(201);
    expect(res.body.data.user).to.not.have.property('password_hash');
    expect(res.body.data).to.have.property('token').that.is.a('string');
  });

  it('rejects a duplicate email with 409', async () => {
    sinon.stub(usersRepository, 'findByEmail').resolves({ id: 1, email: 'ada@example.com' });

    const res = await chai.request(app).post('/api/auth/signup').send({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'supersecret123',
    });

    expect(res).to.have.status(409);
    expect(res.body).to.include.keys('status', 'message', 'requestId');
  });

  it('rejects an invalid payload with 400', async () => {
    const res = await chai.request(app).post('/api/auth/signup').send({
      name: 'A',
      email: 'not-an-email',
      password: '123',
    });

    expect(res).to.have.status(400);
  });
});

describe('POST /api/auth/login', () => {
  afterEach(() => sinon.restore());

  it('logs in with correct credentials', async () => {
    const passwordHash = await bcrypt.hash('supersecret123', 4);
    sinon.stub(usersRepository, 'findByEmail').resolves({
      id: 1,
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const res = await chai.request(app).post('/api/auth/login').send({
      email: 'ada@example.com',
      password: 'supersecret123',
    });

    expect(res).to.have.status(200);
    expect(res.body.data).to.have.property('token').that.is.a('string');
    expect(res.body.data.user).to.not.have.property('password_hash');
  });

  it('rejects an unregistered email with 401', async () => {
    sinon.stub(usersRepository, 'findByEmail').resolves(null);

    const res = await chai.request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'whatever123',
    });

    expect(res).to.have.status(401);
  });

  it('rejects a wrong password with 401', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 4);
    sinon.stub(usersRepository, 'findByEmail').resolves({
      id: 1,
      email: 'ada@example.com',
      password_hash: passwordHash,
    });

    const res = await chai.request(app).post('/api/auth/login').send({
      email: 'ada@example.com',
      password: 'wrong-password',
    });

    expect(res).to.have.status(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('rejects a request with no Bearer token', async () => {
    const res = await chai.request(app).post('/api/auth/logout');
    expect(res).to.have.status(401);
  });

  it('succeeds with a valid Bearer token', async () => {
    const token = jwt.sign({ sub: 1, email: 'ada@example.com' }, env.jwtSecret, {
      expiresIn: '1h',
    });

    const res = await chai
      .request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body.status).to.equal('success');
  });
});
