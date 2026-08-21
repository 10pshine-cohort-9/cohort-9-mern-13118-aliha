import PropTypes from "prop-types";

export default function EditorToolbar({ editor }) {
  if (!editor) return null;

  const buttons = [
    {
      label: "B",
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      active: "bold",
    },
    {
      label: "I",
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      active: "italic",
    },
    {
      label: "U",
      title: "Underline",
      action: () => editor.chain().focus().toggleUnderline().run(),
      active: "underline",
    },
    {
      label: "S",
      title: "Strikethrough",
      action: () => editor.chain().focus().toggleStrike().run(),
      active: "strike",
    },
    {
      label: "`</>`",
      title: "Inline code",
      action: () => editor.chain().focus().toggleCode().run(),
      active: "code",
    },
    {
      label: "H1",
      title: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: { type: "heading", attributes: { level: 1 } },
    },
    {
      label: "H2",
      title: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: { type: "heading", attributes: { level: 2 } },
    },
    {
      label: "P",
      title: "Paragraph",
      action: () => editor.chain().focus().setParagraph().run(),
      active: "paragraph",
    },
    {
      label: "• List",
      title: "Bullet list",
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: "bulletList",
    },
    {
      label: "1. List",
      title: "Numbered list",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: "orderedList",
    },
    {
      label: "Quote",
      title: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: "blockquote",
    },
    {
      label: "Code",
      title: "Code block",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      active: "codeBlock",
    },
    {
      label: "Line",
      title: "Horizontal rule",
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      label: "Clear",
      title: "Clear formatting",
      action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
    },
    {
      label: "Undo",
      title: "Undo",
      action: () => editor.chain().focus().undo().run(),
      disabled: () => !editor.can().chain().focus().undo().run(),
    },
    {
      label: "Redo",
      title: "Redo",
      action: () => editor.chain().focus().redo().run(),
      disabled: () => !editor.can().chain().focus().redo().run(),
    },
  ];

  function setBlockStyle(event) {
    const value = event.target.value;
    const chain = editor.chain().focus();
    if (value === "paragraph") chain.setParagraph().run();
    else chain.toggleHeading({ level: Number(value) }).run();
  }

  function setFontFamily(event) {
    const value = event.target.value;
    const chain = editor.chain().focus();
    if (value === "default") chain.unsetFontFamily().run();
    else chain.setFontFamily(value).run();
  }

  function setFontSize(event) {
    const value = event.target.value;
    const chain = editor.chain().focus();
    if (value === "default") chain.unsetMark("textStyle").run();
    else chain.setMark("textStyle", { fontSize: value }).run();
  }

  function setLink() {
    const currentLink = editor.getAttributes("link").href || "";
    const url = window.prompt("Link URL", currentLink);
    if (url === null) return;
    if (url.trim() === "") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url.trim() }).run();
  }

  function addImage() {
    const src = window.prompt("Image URL");
    if (src?.trim()) editor.chain().focus().setImage({ src: src.trim() }).run();
  }

  const activeHeading = editor.getAttributes("heading").level;
  const activeFont = editor.getAttributes("textStyle").fontFamily || "default";
  const activeFontSize =
    editor.getAttributes("textStyle").fontSize || "default";

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
        value={activeHeading || "paragraph"}
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
        value={activeFont}
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
        value={activeFontSize}
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
      {buttons.map((btn) => (
        <button
          key={btn.title}
          type="button"
          title={btn.title}
          onClick={btn.action}
          disabled={btn.disabled?.()}
          aria-label={btn.title}
          aria-pressed={btn.active ? editor.isActive(btn.active) : undefined}
          className={`px-3 py-1 rounded-full text-sm font-semibold border border-border disabled:opacity-40 disabled:cursor-not-allowed ${
            btn.active && editor.isActive(btn.active)
              ? "bg-mint"
              : "bg-muted hover:bg-secondary"
          }`}
        >
          {btn.label}
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
      <button
        type="button"
        title="Task list"
        aria-label="Task list"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`toolbar-button ${editor.isActive("taskList") ? "bg-mint" : ""}`}
      >
        Tasks
      </button>
      {[
        ["Left", "left"],
        ["Center", "center"],
        ["Right", "right"],
      ].map(([label, alignment]) => (
        <button
          key={alignment}
          type="button"
          title={`Align ${label.toLowerCase()}`}
          aria-label={`Align ${label.toLowerCase()}`}
          onClick={() => editor.chain().focus().setTextAlign(alignment).run()}
          className={`toolbar-button ${editor.isActive({ textAlign: alignment }) ? "bg-mint" : ""}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

EditorToolbar.propTypes = {
  editor: PropTypes.object,
};
