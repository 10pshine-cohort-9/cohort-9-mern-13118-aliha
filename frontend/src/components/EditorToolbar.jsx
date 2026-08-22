import PropTypes from "prop-types";

export default function EditorToolbar({ editor }) {
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
      "Code",
      "Inline code",
      () => editor.chain().focus().toggleCode().run(),
      "code",
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
    [
      "Block",
      "Code block",
      () => editor.chain().focus().toggleCodeBlock().run(),
      "codeBlock",
    ],
  ];

  function setBlockStyle(event) {
    const value = event.target.value;
    const chain = editor.chain().focus();
    if (value === "paragraph") chain.setParagraph().run();
    else chain.toggleHeading({ level: Number(value) }).run();
  }

  function setFontFamily(event) {
    const value = event.target.value;
    if (value === "default") editor.chain().focus().unsetFontFamily().run();
    else editor.chain().focus().setFontFamily(value).run();
  }

  function setFontSize(event) {
    const value = event.target.value;
    if (value === "default")
      editor.chain().focus().unsetMark("textStyle").run();
    else editor.chain().focus().setMark("textStyle", { fontSize: value }).run();
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

  const headingLevel = editor.getAttributes("heading").level;
  const fontFamily = editor.getAttributes("textStyle").fontFamily || "default";
  const fontSize = editor.getAttributes("textStyle").fontSize || "default";

  return (
    <div className="flex flex-wrap items-center gap-1 mb-3 p-2 rounded-xl border border-border bg-muted">
      <button
        type="button"
        title="Zoom out"
        aria-label="Zoom out"
        className="toolbar-button"
      >
        -
      </button>
      <span className="px-2 text-xs font-semibold text-muted-foreground">
        100%
      </span>
      <button
        type="button"
        title="Zoom in"
        aria-label="Zoom in"
        className="toolbar-button"
      >
        +
      </button>
      <span className="toolbar-divider" />
      <select
        title="Block style"
        aria-label="Block style"
        value={headingLevel || "paragraph"}
        onChange={setBlockStyle}
        className="toolbar-select"
      >
        <option value="paragraph">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>
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
          onClick={action}
          className={`toolbar-button ${editor.isActive(active) ? "bg-mint" : ""}`}
        >
          {label}
        </button>
      ))}
      <label title="Text color" className="toolbar-color">
        <span aria-hidden="true">A</span>
        <input
          type="color"
          aria-label="Text color"
          onChange={(event) =>
            editor.chain().focus().setColor(event.target.value).run()
          }
        />
      </label>
      <label title="Highlight color" className="toolbar-color">
        <span aria-hidden="true">H</span>
        <input
          type="color"
          aria-label="Highlight color"
          onChange={(event) =>
            editor
              .chain()
              .focus()
              .toggleHighlight({ color: event.target.value })
              .run()
          }
        />
      </label>
      <button
        type="button"
        title="Link"
        aria-label="Link"
        onClick={setLink}
        className="toolbar-button"
      >
        Link
      </button>
      <button
        type="button"
        title="Insert image"
        aria-label="Insert image"
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
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="toolbar-button"
      >
        Line
      </button>
      <button
        type="button"
        title="Clear formatting"
        aria-label="Clear formatting"
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
  editor: PropTypes.object,
};
