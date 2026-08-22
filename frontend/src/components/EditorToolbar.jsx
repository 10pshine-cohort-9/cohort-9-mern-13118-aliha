import PropTypes from "prop-types";
import { useEditorState } from "@tiptap/react";
import { Editor } from "@tiptap/core";

function preserveSelection(event) {
  event.preventDefault();
}

export default function EditorToolbar({ editor }) {
  useEditorState({
    editor,
    selector: (snapshot) => snapshot?.transactionNumber ?? 0,
  });

  if (!editor) return null;

  const buttons = [
    ["B", "Bold", () => editor.chain().focus().toggleBold().run(), "bold"],
    [
      "I",
      "Italic",
      () => editor.chain().focus().toggleItalic().run(),
      "italic",
    ],
    [
      "U",
      "Underline",
      () => editor.chain().focus().toggleUnderline().run(),
      "underline",
    ],
    [
      "S",
      "Strikethrough",
      () => editor.chain().focus().toggleStrike().run(),
      "strike",
    ],
    [
      "• List",
      "Bullet list",
      () => editor.chain().focus().toggleBulletList().run(),
      "bulletList",
    ],
    [
      "1. List",
      "Numbered list",
      () => editor.chain().focus().toggleOrderedList().run(),
      "orderedList",
    ],
    [
      "Tasks",
      "Task list",
      () => editor.chain().focus().toggleTaskList().run(),
      "taskList",
    ],
    [
      "Quote",
      "Blockquote",
      () => editor.chain().focus().toggleBlockquote().run(),
      "blockquote",
    ],
  ];

  function setFontFamily(event) {
    const value = event.target.value;
    if (value === "default") editor.chain().focus().unsetFontFamily().run();
    else editor.chain().focus().setFontFamily(value).run();
  }

  function setFontSize(event) {
    const value = event.target.value;
    if (value === "default") editor.chain().focus().unsetFontSize().run();
    else editor.chain().focus().setFontSize(value).run();
  }

  function setLink() {
    const currentLink = editor.getAttributes("link").href || "";
    const url = window.prompt("Link URL", currentLink);
    if (url === null) return;
    if (!url.trim()) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url.trim() }).run();
  }

  function addImage() {
    const src = window.prompt("Image URL");
    if (src?.trim()) editor.chain().focus().setImage({ src: src.trim() }).run();
  }

  const fontFamily = editor.getAttributes("textStyle").fontFamily || "default";
  const fontSize = editor.getAttributes("textStyle").fontSize || "default";

  return (
    <div className="flex flex-wrap items-center gap-1 mb-3 p-2 rounded-xl border border-border bg-muted">
      <select
        title="Font family"
        aria-label="Font family"
        value={fontFamily}
        onChange={setFontFamily}
        className="toolbar-select"
      >
        <option value="default">Default</option>
        <option value="Arial">Arial</option>
        <option value="Georgia">Georgia</option>
        <option value="Courier New">Courier New</option>
      </select>
      <select
        title="Font size"
        aria-label="Font size"
        value={fontSize}
        onChange={setFontSize}
        className="toolbar-select w-20"
      >
        <option value="default">Size</option>
        <option value="14px">14</option>
        <option value="16px">16</option>
        <option value="18px">18</option>
        <option value="24px">24</option>
        <option value="32px">32</option>
      </select>
      <span className="toolbar-divider" />
      {buttons.map(([label, title, action, active]) => (
        <button
          key={title}
          type="button"
          title={title}
          aria-label={title}
          aria-pressed={editor.isActive(active)}
          onMouseDown={preserveSelection}
          onClick={action}
          className={`toolbar-button ${editor.isActive(active) ? "bg-mint" : ""}`}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        title="Link"
        aria-label="Link"
        onMouseDown={preserveSelection}
        onClick={setLink}
        className="toolbar-button"
      >
        Link
      </button>
      <button
        type="button"
        title="Insert image"
        aria-label="Insert image"
        onMouseDown={preserveSelection}
        onClick={addImage}
        className="toolbar-button"
      >
        Image
      </button>
      {["left", "center", "right"].map((alignment) => (
        <button
          key={alignment}
          type="button"
          title={`Align ${alignment}`}
          aria-label={`Align ${alignment}`}
          onMouseDown={preserveSelection}
          onClick={() => editor.chain().focus().setTextAlign(alignment).run()}
          className={`toolbar-button ${editor.isActive({ textAlign: alignment }) ? "bg-mint" : ""}`}
        >
          {alignment[0].toUpperCase()}
        </button>
      ))}
      <button
        type="button"
        title="Horizontal rule"
        aria-label="Horizontal rule"
        onMouseDown={preserveSelection}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="toolbar-button"
      >
        Line
      </button>
      <button
        type="button"
        title="Clear formatting"
        aria-label="Clear formatting"
        onMouseDown={preserveSelection}
        onClick={() =>
          editor.chain().focus().clearNodes().unsetAllMarks().run()
        }
        className="toolbar-button"
      >
        Clear
      </button>
      <button
        type="button"
        title="Undo"
        aria-label="Undo"
        onMouseDown={preserveSelection}
        disabled={!editor.can().chain().undo().run()}
        onClick={() => editor.chain().focus().undo().run()}
        className="toolbar-button"
      >
        Undo
      </button>
      <button
        type="button"
        title="Redo"
        aria-label="Redo"
        onMouseDown={preserveSelection}
        disabled={!editor.can().chain().redo().run()}
        onClick={() => editor.chain().focus().redo().run()}
        className="toolbar-button"
      >
        Redo
      </button>
    </div>
  );
}

EditorToolbar.propTypes = {
  editor: PropTypes.instanceOf(Editor),
};
