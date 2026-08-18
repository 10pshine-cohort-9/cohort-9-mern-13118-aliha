// Pulls plain text out of a TipTap/ProseMirror JSON doc, for previews
// (e.g. the dashboard note cards) where we don't want to render full rich text.
export function extractText(doc) {
  if (!doc) return '';
  if (doc.text) return doc.text;
  if (!doc.content) return '';
  return doc.content.map(extractText).join(' ').trim();
}
