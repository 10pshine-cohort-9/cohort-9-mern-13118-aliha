const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/app');

chai.use(chaiHttp);
const { expect } = chai;

describe('GET /api/health', () => {
  it('returns 200 with an ok status', async () => {
    const res = await chai.request(app).get('/api/health');
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('status', 'ok');
    expect(res.body).to.have.property('uptime');
  });
});

describe('Unknown route', () => {
  it('returns a uniform { status, message, requestId } 404 shape', async () => {
    const res = await chai.request(app).get('/api/does-not-exist');
    expect(res).to.have.status(404);
    expect(res.body).to.include.keys('status', 'message', 'requestId');
    expect(res.body.status).to.equal('error');
  });

  it('echoes back a client-supplied X-Request-Id', async () => {
    const res = await chai
      .request(app)
      .get('/api/does-not-exist')
      .set('X-Request-Id', 'test-request-id-123');
    expect(res.body.requestId).to.equal('test-request-id-123');
  });
});
