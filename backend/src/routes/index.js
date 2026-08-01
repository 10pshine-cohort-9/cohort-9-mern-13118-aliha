const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const notesRoutes = require('./notes.routes');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/notes', authenticate, notesRoutes);

module.exports = router;
