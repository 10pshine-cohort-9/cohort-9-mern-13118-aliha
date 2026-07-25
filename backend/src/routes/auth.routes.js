const express = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Public per the STS API contract.
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Required per the STS API contract — confirms the caller held a valid
// token; see the KNOWN LIMITATION note in auth.controller.js re: revocation.
router.post('/logout', authenticate, authController.logout);

module.exports = router;
