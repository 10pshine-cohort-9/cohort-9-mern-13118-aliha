import PropTypes from 'prop-types';

export default function EditorToolbar({ editor }) {
  if (!editor) return null;

  const buttons = [
    { label: 'B', title: 'Bold', action: () => editor.chain().focus().toggleBold().run(), active: 'bold' },
    { label: 'I', title: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), active: 'italic' },
    {
      label: '• List',
      title: 'Bullet list',
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: 'bulletList',
    },
    {
      label: '1. List',
      title: 'Numbered list',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: 'orderedList',
    },
  ];

  return (
    <div className="flex gap-2 mb-3">
      {buttons.map((btn) => (
        <button
          key={btn.title}
          type="button"
          title={btn.title}
          onClick={btn.action}
          className={`px-3 py-1 rounded-full text-sm font-semibold border border-border ${
            editor.isActive(btn.active) ? 'bg-mint' : 'bg-muted hover:bg-secondary'
          }`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}

EditorToolbar.propTypes = {
  editor: PropTypes.object,
};
