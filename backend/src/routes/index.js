const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');

// TODO (Sprint 2 - Notes CRUD task): mount notes routes, guarded by
// the `authenticate` middleware per the STS API contract.
// const authenticate = require('../middleware/authenticate');
// const notesRoutes = require('./notes.routes');

const router = express.Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
// router.use('/notes', authenticate, notesRoutes);

module.exports = router;
