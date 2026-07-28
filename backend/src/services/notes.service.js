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
  const updates = {};
  if (title !== undefined) updates.title = title.trim();
  if (content !== undefined) updates.content = content;

  // A partial update (only title, or only content) still needs both
  // columns written, since the UPDATE always sets both — fetch whichever
  // wasn't provided so we don't overwrite it with NULL.
  if (updates.title === undefined || updates.content === undefined) {
    const existing = await notesRepository.findByIdForUser(noteId, userId);
    if (!existing) {
      throw new AppError('Note not found', 404);
    }
    if (updates.title === undefined) updates.title = existing.title;
    if (updates.content === undefined) updates.content = existing.content;
  }

  const updated = await notesRepository.updateForUser(noteId, userId, updates);
  if (!updated) {
    // Note existed during the read above but is gone now (deleted
    // concurrently) — still a 404, not a 500.
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
