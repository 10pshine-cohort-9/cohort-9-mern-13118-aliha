const MAX_TITLE_LENGTH = 200;

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateCreateNote({ title, content } = {}) {
  const errors = [];

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    errors.push("title is required");
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.push(`title must be ${MAX_TITLE_LENGTH} characters or fewer`);
  }

  if (content === undefined || content === null) {
    errors.push("content is required");
  } else if (!isPlainObject(content)) {
    errors.push("content must be a JSON object");
  }

  return errors;
}

function validateUpdateNote({ title, content } = {}) {
  const errors = [];

  if (title === undefined && content === undefined) {
    errors.push("at least one of title or content must be provided");
    return errors;
  }

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      errors.push("title must be a non-empty string");
    } else if (title.length > MAX_TITLE_LENGTH) {
      errors.push(`title must be ${MAX_TITLE_LENGTH} characters or fewer`);
    }
  }

  if (content !== undefined && !isPlainObject(content)) {
    errors.push("content must be a JSON object");
  }

  return errors;
}

function parseNoteId(rawId) {
  if (!/^\d+$/.test(String(rawId))) {
    return null;
  }
  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

module.exports = {
  validateCreateNote,
  validateUpdateNote,
  parseNoteId,
  MAX_TITLE_LENGTH,
};
