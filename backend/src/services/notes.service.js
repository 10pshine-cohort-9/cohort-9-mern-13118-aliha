const AppError = require('../utils/AppError');
const notesRepository = require('../data-access/notes.repository');

async function listNotes(userId) {
  return notesRepository.findAllByUserId(userId);
}

async function createNote(userId, { title, content }) {
  return notesRepository.create({ userId, title: title.trim(), content });
}

async function getNote(userId, noteId) {
  const note = await notesRepository.findByIdForUser(noteId, userId);
  if (!note) {
    // Deliberately the same 404 whether the note doesn't exist at all,
    // or exists but belongs to someone else — never confirm to a caller
    // that a given note ID is "real but not yours".
    throw new AppError('Note not found', 404);
  }
  return note;
}

async function updateNote(userId, noteId, { title, content }) {
  const updated = await notesRepository.updateForUser(noteId, userId, {
    title: title !== undefined ? title.trim() : undefined,
    content,
  });

  if (!updated) {
    // Covers both "never existed"/"not yours" and "existed but was
    // deleted concurrently" — either way, a clean 404, not a 500.
    throw new AppError('Note not found', 404);
  }

  return updated;
}

async function deleteNote(userId, noteId) {
  const deleted = await notesRepository.deleteForUser(noteId, userId);
  if (!deleted) {
    throw new AppError('Note not found', 404);
  }
}

module.exports = { listNotes, createNote, getNote, updateNote, deleteNote };
