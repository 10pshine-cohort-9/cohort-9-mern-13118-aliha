#!/usr/bin/env node
/**
 * Lightweight SQL migration runner for PostgreSQL.
 *
 * Applies *.sql files in this directory in filename order, tracking what
 * has already been applied in a `schema_migrations` table. Each numbered
 * migration (e.g. 001_create_users_table.sql) has a matching
 * `<name>.down.sql` used to revert it.
 *
 * Usage:
 *   node migrations/run-migrations.js          apply all pending migrations
 *   node migrations/run-migrations.js --down   revert the most recent migration
 *   npm run migrate / npm run migrate:down     (see package.json)
 */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const env = require("../src/config/env");

const MIGRATIONS_DIR = __dirname;

const pool = new Pool({ connectionString: env.databaseUrl });

// Arbitrary, fixed lock key for this app's migrations. Session-level
// advisory locks are PostgreSQL's mechanism for "only one process does
// this at a time" without needing a separate lock table — without it,
// two concurrent `npm run migrate` runs (e.g. two teammates, or a CI
// race) could both read "no pending migrations applied yet" and then
// both try to apply the same one, racing on the same INSERT.
const MIGRATION_LOCK_KEY = 7_291_853;

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

function listUpMigrations() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql") && !f.endsWith(".down.sql"))
    .sort();
}

async function getAppliedMigrations(client) {
  const { rows } = await client.query(
    "SELECT name FROM schema_migrations ORDER BY id ASC",
  );
  return rows.map((r) => r.name);
}

async function migrateUp() {
  let client;
  try {
    client = await pool.connect();
    await client.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_KEY]);
    try {
      await ensureMigrationsTable(client);
      const applied = await getAppliedMigrations(client);
      const pending = listUpMigrations().filter(
        (name) => !applied.includes(name),
      );

      if (pending.length === 0) {
        console.log("No pending migrations. Database is up to date.");
        return;
      }

      for (const name of pending) {
        const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, name), "utf8");
        console.log(`Applying migration: ${name}`);
        await client.query("BEGIN");
        try {
          await client.query(sql);
          await client.query(
            "INSERT INTO schema_migrations (name) VALUES ($1)",
            [name],
          );
          await client.query("COMMIT");
          console.log(`  -> applied ${name}`);
        } catch (err) {
          await client.query("ROLLBACK");
          throw new Error(`Migration failed: ${name}\n${err.message}`);
        }
      }
    } finally {
      await client.query("SELECT pg_advisory_unlock($1)", [MIGRATION_LOCK_KEY]);
    }
  } catch (err) {
    throw new Error(`migrateUp failed: ${err.message}`, { cause: err });
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function migrateDown() {
  let client;
  try {
    client = await pool.connect();
    await client.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_KEY]);
    try {
      await ensureMigrationsTable(client);
      const applied = await getAppliedMigrations(client);

      if (applied.length === 0) {
        console.log("No migrations to revert.");
        return;
      }

      const last = applied[applied.length - 1];
      const downFile = last.replace(/\.sql$/, ".down.sql");
      const downPath = path.join(MIGRATIONS_DIR, downFile);

      if (!fs.existsSync(downPath)) {
        throw new Error(
          `No down migration found for ${last} (expected ${downFile})`,
        );
      }

      const sql = fs.readFileSync(downPath, "utf8");
      console.log(`Reverting migration: ${last}`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("DELETE FROM schema_migrations WHERE name = $1", [
          last,
        ]);
        await client.query("COMMIT");
        console.log(`  -> reverted ${last}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`Rollback failed: ${last}\n${err.message}`);
      }
    } finally {
      await client.query("SELECT pg_advisory_unlock($1)", [MIGRATION_LOCK_KEY]);
    }
  } catch (err) {
    throw new Error(`migrateDown failed: ${err.message}`, { cause: err });
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function main() {
  const isDown = process.argv.includes("--down");
  try {
    if (isDown) {
      await migrateDown();
    } else {
      await migrateUp();
    }
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    try {
      await pool.end();
    } catch (err) {
      // A failure to close the pool cleanly shouldn't be silently
      // swallowed — it wouldn't crash the process (this is the last
      // thing that runs), but it should still be visible and still
      // affect the exit code.
      console.error("Error while closing the database pool:", err.message);
      process.exitCode = 1;
    }
  }
}

main();
