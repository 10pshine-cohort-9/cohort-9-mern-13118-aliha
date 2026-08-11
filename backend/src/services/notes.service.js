const AppError = require("../utils/AppError");
const notesRepository = require("../data-access/notes.repository");

async function listNotes(userId) {
  return notesRepository.findAllByUserId(userId);
}

async function createNote(userId, { title, content }) {
  return notesRepository.create({ userId, title: title.trim(), content });
}

async function getNote(userId, noteId) {
  const note = await notesRepository.findByIdForUser(noteId, userId);
  if (!note) {
    throw new AppError("Note not found", 404);
  }
  return note;
}

async function updateNote(userId, noteId, { title, content }) {
  const updated = await notesRepository.updateForUser(noteId, userId, {
    title: title !== undefined ? title.trim() : undefined,
    content,
  });

  if (!updated) {
    throw new AppError("Note not found", 404);
  }

  return updated;
}

async function deleteNote(userId, noteId) {
  const deleted = await notesRepository.deleteForUser(noteId, userId);
  if (!deleted) {
    throw new AppError("Note not found", 404);
  }
}

module.exports = { listNotes, createNote, getNote, updateNote, deleteNote };
