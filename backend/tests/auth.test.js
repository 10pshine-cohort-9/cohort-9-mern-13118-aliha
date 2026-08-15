const chai = require("chai");
const chaiHttp = require("chai-http");
const sinon = require("sinon");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const env = require("../src/config/env");
const usersRepository = require("../src/data-access/users.repository");

chai.use(chaiHttp);
const { expect } = chai;

describe("POST /api/auth/signup", () => {
  afterEach(() => sinon.restore());

  it("creates a user and returns a token, never leaking password_hash", async () => {
    sinon.stub(usersRepository, "findByEmail").resolves(null);
    sinon.stub(usersRepository, "createUser").resolves({
      id: 1,
      name: "Ada Lovelace",
      email: "ada@example.com",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const res = await chai.request(app).post("/api/auth/signup").send({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "supersecret123",
    });

    expect(res).to.have.status(201);
    expect(res.body.data.user).to.not.have.property("password_hash");
    expect(res.body.data).to.have.property("csrfToken").that.is.a("string");
    expect(res.headers["set-cookie"]).to.satisfy((cookies) => {
      if (!Array.isArray(cookies)) return false;
      const csrfCookie = cookies.find((c) => c.startsWith("csrfToken="));
      if (!csrfCookie) return false;
      const cookieValue = decodeURIComponent(
        csrfCookie.split("=")[1].split(";")[0],
      );
      return cookieValue === res.body.data.csrfToken;
    });
    expect(res.headers["set-cookie"]).to.satisfy(
      (cookies) =>
        Array.isArray(cookies) &&
        cookies.some((cookie) => cookie.startsWith("access_token=")),
    );
  });

  it("rejects a duplicate email with 409", async () => {
    sinon
      .stub(usersRepository, "findByEmail")
      .resolves({ id: 1, email: "ada@example.com" });

    const res = await chai.request(app).post("/api/auth/signup").send({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "supersecret123",
    });

    expect(res).to.have.status(409);
    expect(res.body).to.include.keys("status", "message", "requestId");
  });

  it("maps a concurrent duplicate (PG unique-violation past the pre-check) to 409, not 500", async () => {
    // Simulates the race: findByEmail sees no user (both concurrent
    // requests can), but the INSERT itself hits the DB's UNIQUE
    // constraint because the other request won the race.
    sinon.stub(usersRepository, "findByEmail").resolves(null);
    const pgUniqueViolation = new Error(
      "duplicate key value violates unique constraint",
    );
    pgUniqueViolation.code = "23505";
    sinon.stub(usersRepository, "createUser").rejects(pgUniqueViolation);

    const res = await chai.request(app).post("/api/auth/signup").send({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "supersecret123",
    });

    expect(res).to.have.status(409);
    expect(res.body).to.include.keys("status", "message", "requestId");
  });

  it("rejects an invalid payload with 400 and structured field errors", async () => {
    const res = await chai.request(app).post("/api/auth/signup").send({
      name: "A",
      email: "not-an-email",
      password: "123",
    });

    expect(res).to.have.status(400);
    expect(res.body.message).to.equal("Validation failed");
    expect(res.body.details)
      .to.have.property("errors")
      .that.is.an("array")
      .with.length.above(0);
  });
});

describe("POST /api/auth/login", () => {
  afterEach(() => sinon.restore());

  it("logs in with correct credentials", async () => {
    const passwordHash = await bcrypt.hash("supersecret123", 4);
    sinon.stub(usersRepository, "findByEmail").resolves({
      id: 1,
      name: "Ada Lovelace",
      email: "ada@example.com",
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const res = await chai.request(app).post("/api/auth/login").send({
      email: "ada@example.com",
      password: "supersecret123",
    });

    expect(res).to.have.status(200);
    expect(res.body.data).to.have.property("csrfToken").that.is.a("string");
    expect(res.headers["set-cookie"]).to.satisfy((cookies) => {
      if (!Array.isArray(cookies)) return false;
      const csrfCookie = cookies.find((c) => c.startsWith("csrfToken="));
      if (!csrfCookie) return false;
      const cookieValue = decodeURIComponent(
        csrfCookie.split("=")[1].split(";")[0],
      );
      return cookieValue === res.body.data.csrfToken;
    });
    expect(res.headers["set-cookie"]).to.satisfy(
      (cookies) =>
        Array.isArray(cookies) &&
        cookies.some((cookie) => cookie.startsWith("access_token=")),
    );
    expect(res.body.data.user).to.not.have.property("password_hash");
  });

  it("rejects an unregistered email with 401", async () => {
    sinon.stub(usersRepository, "findByEmail").resolves(null);

    const res = await chai.request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "whatever123",
    });

    expect(res).to.have.status(401);
  });

  it("rejects a wrong password with 401", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 4);
    sinon.stub(usersRepository, "findByEmail").resolves({
      id: 1,
      email: "ada@example.com",
      password_hash: passwordHash,
    });

    const res = await chai.request(app).post("/api/auth/login").send({
      email: "ada@example.com",
      password: "wrong-password",
    });

    expect(res).to.have.status(401);
  });
});

describe("POST /api/auth/logout", () => {
  afterEach(() => sinon.restore());

  it("rejects a request with no Bearer token", async () => {
    const res = await chai.request(app).post("/api/auth/logout");
    expect(res).to.have.status(401);
  });

  it("succeeds with a valid Bearer token", async () => {
    const token = jwt.sign(
      { sub: 1, email: "ada@example.com" },
      env.jwtSecret,
      {
        expiresIn: "1h",
      },
    );

    const res = await chai
      .request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body.status).to.equal("success");
  });

  it("succeeds with valid cookie auth and matching CSRF token", async () => {
    const passwordHash = await bcrypt.hash("supersecret123", 4);
    sinon.stub(usersRepository, "findByEmail").resolves({
      id: 1,
      name: "Ada Lovelace",
      email: "ada@example.com",
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const loginRes = await chai.request(app).post("/api/auth/login").send({
      email: "ada@example.com",
      password: "supersecret123",
    });

    expect(loginRes).to.have.status(200);
    const csrfToken = loginRes.body.data.csrfToken;
    const cookies = loginRes.headers["set-cookie"];

    const logoutRes = await chai
      .request(app)
      .post("/api/auth/logout")
      .set("Cookie", cookies.join("; "))
      .set("X-CSRF-Token", csrfToken);

    expect(logoutRes).to.have.status(200);
    expect(logoutRes.body.status).to.equal("success");
  });

  it("rejects cookie auth logout with missing CSRF token", async () => {
    const passwordHash = await bcrypt.hash("supersecret123", 4);
    sinon.stub(usersRepository, "findByEmail").resolves({
      id: 1,
      name: "Ada Lovelace",
      email: "ada@example.com",
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const loginRes = await chai.request(app).post("/api/auth/login").send({
      email: "ada@example.com",
      password: "supersecret123",
    });

    expect(loginRes).to.have.status(200);
    const cookies = loginRes.headers["set-cookie"];

    const logoutRes = await chai
      .request(app)
      .post("/api/auth/logout")
      .set("Cookie", cookies.join("; "));

    expect(logoutRes).to.have.status(403);
    expect(logoutRes.body.message).to.include("CSRF");
  });

  it("rejects cookie auth logout with mismatched CSRF token", async () => {
    const passwordHash = await bcrypt.hash("supersecret123", 4);
    sinon.stub(usersRepository, "findByEmail").resolves({
      id: 1,
      name: "Ada Lovelace",
      email: "ada@example.com",
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const loginRes = await chai.request(app).post("/api/auth/login").send({
      email: "ada@example.com",
      password: "supersecret123",
    });

    expect(loginRes).to.have.status(200);
    const cookies = loginRes.headers["set-cookie"];
    const wrongCsrfToken = "wrong-csrf-token-value";

    const logoutRes = await chai
      .request(app)
      .post("/api/auth/logout")
      .set("Cookie", cookies.join("; "))
      .set("X-CSRF-Token", wrongCsrfToken);

    expect(logoutRes).to.have.status(403);
    expect(logoutRes.body.message).to.include("CSRF");
  });
});
