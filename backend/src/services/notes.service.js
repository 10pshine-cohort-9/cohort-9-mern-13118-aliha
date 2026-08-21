const AppError = require("../utils/AppError");
const notesRepository = require("../data-access/notes.repository");

async function listNotes(userId, filters) {
  return notesRepository.findAllByUserId(userId, filters);
}

async function createNote(
  userId,
  { title, content, tags = [], category = null },
) {
  return notesRepository.create({
    userId,
    title: title.trim(),
    content,
    tags: normalizeTags(tags),
    category: normalizeCategory(category),
  });
}

async function getNote(userId, noteId) {
  const note = await notesRepository.findByIdForUser(noteId, userId);
  if (!note) {
    throw new AppError("Note not found", 404);
  }
  return note;
}

async function updateNote(
  userId,
  noteId,
  { title, content, tags, category, is_pinned, is_archived },
) {
  const changes = {
    title: title !== undefined ? title.trim() : undefined,
    content,
  };

  if (tags !== undefined) changes.tags = normalizeTags(tags);
  if (category !== undefined) changes.category = normalizeCategory(category);
  if (is_pinned !== undefined) changes.is_pinned = is_pinned;
  if (is_archived !== undefined) changes.is_archived = is_archived;

  const updated = await notesRepository.updateForUser(noteId, userId, {
    ...changes,
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

function normalizeTags(tags) {
  return [...new Set(tags.map((tag) => tag.trim().toLowerCase()))];
}

function normalizeCategory(category) {
  return category?.trim() || null;
}

module.exports = { listNotes, createNote, getNote, updateNote, deleteNote };
