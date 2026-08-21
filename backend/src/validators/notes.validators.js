const MAX_TITLE_LENGTH = 200;
const MAX_CATEGORY_LENGTH = 100;
const MAX_TAG_LENGTH = 40;
const MAX_TAGS = 20;

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateMetadata({ tags, category, ...metadata }, errors) {
  if (tags !== undefined) {
    if (!Array.isArray(tags) || tags.length > MAX_TAGS) {
      errors.push(`tags must be an array of ${MAX_TAGS} items or fewer`);
    } else if (
      tags.some(
        (tag) =>
          typeof tag !== "string" ||
          tag.trim().length === 0 ||
          tag.trim().length > MAX_TAG_LENGTH,
      )
    ) {
      errors.push(
        `each tag must be a non-empty string of ${MAX_TAG_LENGTH} characters or fewer`,
      );
    }
  }

  if (
    category !== undefined &&
    category !== null &&
    (typeof category !== "string" ||
      category.trim().length > MAX_CATEGORY_LENGTH)
  ) {
    errors.push(`category must be ${MAX_CATEGORY_LENGTH} characters or fewer`);
  }

  for (const field of ["is_pinned", "is_archived"]) {
    if (metadata[field] !== undefined && typeof metadata[field] !== "boolean") {
      errors.push(`${field} must be a boolean`);
    }
  }
}

function validateCreateNote(payload = {}) {
  const { title, content } = payload;
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

  validateMetadata(payload, errors);

  return errors;
}

function validateUpdateNote(payload = {}) {
  const { title, content, tags, category, is_pinned, is_archived } = payload;
  const errors = [];

  if (
    title === undefined &&
    content === undefined &&
    tags === undefined &&
    category === undefined &&
    is_pinned === undefined &&
    is_archived === undefined
  ) {
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

  validateMetadata(payload, errors);

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
  MAX_CATEGORY_LENGTH,
  MAX_TAG_LENGTH,
  MAX_TAGS,
};
