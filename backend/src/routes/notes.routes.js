const express = require('express');
const notesController = require('../controllers/notes.controller');

const router = express.Router();

// All routes on this router require authentication — enforced by
// mounting it behind the `authenticate` middleware in routes/index.js,
// not repeated on every individual route here.
router.get('/', notesController.list);
router.post('/', notesController.create);
router.get('/:id', notesController.getOne);
router.put('/:id', notesController.update);
router.delete('/:id', notesController.remove);

module.exports = router;
