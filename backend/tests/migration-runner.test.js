const { expect } = require("chai");
const { splitSqlStatements } = require("../migrations/run-migrations");

describe("Migration SQL splitter", () => {
  it("splits ordinary statements", () => {
    expect(
      splitSqlStatements(
        "CREATE TABLE one (id int); CREATE TABLE two (id int);",
      ),
    ).to.deep.equal(["CREATE TABLE one (id int)", "CREATE TABLE two (id int)"]);
  });

  it("preserves semicolons inside quoted strings and identifiers", () => {
    expect(
      splitSqlStatements(
        "INSERT INTO notes (title) VALUES ('a; b'); SELECT \"column;name\" FROM notes;",
      ),
    ).to.deep.equal([
      "INSERT INTO notes (title) VALUES ('a; b')",
      'SELECT "column;name" FROM notes',
    ]);
  });

  it("preserves semicolons inside line and block comments", () => {
    expect(
      splitSqlStatements(
        "-- comment; still comment\nSELECT 1; /* outer; /* nested; */ still */ SELECT 2;",
      ),
    ).to.deep.equal([
      "-- comment; still comment\nSELECT 1",
      "/* outer; /* nested; */ still */ SELECT 2",
    ]);
  });

  it("preserves semicolons inside dollar-quoted function bodies", () => {
    expect(
      splitSqlStatements(
        "CREATE FUNCTION test() RETURNS void AS $body$ BEGIN PERFORM 1; END; $body$ LANGUAGE plpgsql; SELECT 3;",
      ),
    ).to.deep.equal([
      "CREATE FUNCTION test() RETURNS void AS $body$ BEGIN PERFORM 1; END; $body$ LANGUAGE plpgsql",
      "SELECT 3",
    ]);
  });
});
