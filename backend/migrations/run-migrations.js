const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");
const env = require("../src/config/env");

const MIGRATIONS_DIR = __dirname;

const pool = new Pool({ connectionString: env.databaseUrl });

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
  const client = await pool.connect();
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
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
          name,
        ]);
        await client.query("COMMIT");
        console.log(`  -> applied ${name}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`Migration failed: ${name}\n${err.message}`);
      }
    }
  } finally {
    client.release();
  }
}

async function migrateDown() {
  const client = await pool.connect();
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
    client.release();
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
    await pool.end();
  }
}

main();
