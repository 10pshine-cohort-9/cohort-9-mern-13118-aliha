const notesService = require('../services/notes.service');
const {
  validateCreateNote,
  validateUpdateNote,
  parseNoteId,
} = require('../validators/notes.validators');
const AppError = require('../utils/AppError');

async function list(req, res, next) {
  try {
    const notes = await notesService.listNotes(req.user.id);
    res.status(200).json({ status: 'success', data: { notes } });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const errors = validateCreateNote(req.body);
    if (errors.length > 0) {
      throw new AppError('Validation failed', 400, { errors });
    }

    const { title, content } = req.body;
    const note = await notesService.createNote(req.user.id, { title, content });

    res.status(201).json({ status: 'success', data: { note } });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const noteId = parseNoteId(req.params.id);
    if (noteId === null) {
      throw new AppError('Invalid note id', 400);
    }

    const note = await notesService.getNote(req.user.id, noteId);
    res.status(200).json({ status: 'success', data: { note } });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const noteId = parseNoteId(req.params.id);
    if (noteId === null) {
      throw new AppError('Invalid note id', 400);
    }

    const errors = validateUpdateNote(req.body);
    if (errors.length > 0) {
      throw new AppError('Validation failed', 400, { errors });
    }

    const { title, content } = req.body;
    const note = await notesService.updateNote(req.user.id, noteId, { title, content });

    res.status(200).json({ status: 'success', data: { note } });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const noteId = parseNoteId(req.params.id);
    if (noteId === null) {
      throw new AppError('Invalid note id', 400);
    }

    await notesService.deleteNote(req.user.id, noteId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getOne, update, remove };
