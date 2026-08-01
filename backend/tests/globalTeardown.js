const pool = require('../src/config/db');

// Registered as a Mocha root hook (see .mocharc.json's "file" option),
// so this runs once after the entire suite finishes, regardless of which
// test files ran. Without this, the pg Pool's idle client(s) can keep
// the event loop alive, which --exit was previously papering over —
// masking any *other* genuinely leaked handle in the process.
after(async () => {
  await pool.end();
});
