import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import apiClient from "../services/apiClient";
import EditorToolbar from "../components/EditorToolbar";

export default function NoteEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [category, setCategory] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class:
          "ruled-paper min-h-[240px] px-1 py-2 focus:outline-none leading-8",
      },
    },
  });

  useEffect(() => {
    if (isNew || !editor) return;

    let isActive = true;
    setLoading(true);
    setError("");

    apiClient
      .get(`/notes/${id}`)
      .then((res) => {
        if (!isActive) return;

        const note = res.data.data.note;
        setTitle(note.title);
        setTagsInput((note.tags || []).join(", "));
        setCategory(note.category || "");
        setIsPinned(note.is_pinned);
        setIsArchived(note.is_archived);
        editor.commands.setContent(note.content);
      })
      .catch(() => {
        if (!isActive) return;
        setError("Note not found");
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew, editor]);

  async function handleSave(e) {
    e.preventDefault();
    if (!editor) return;
    setError("");
    setSaving(true);
    const content = editor.getJSON();
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    try {
      if (isNew) {
        await apiClient.post("/notes", {
          title,
          content,
          tags,
          category,
          is_pinned: isPinned,
          is_archived: isArchived,
        });
      } else {
        await apiClient.put(`/notes/${id}`, {
          title,
          content,
          tags,
          category,
          is_pinned: isPinned,
          is_archived: isArchived,
        });
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save note");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this note?")) return;
    try {
      await apiClient.delete(`/notes/${id}`);
      navigate("/dashboard");
    } catch {
      setError("Could not delete note");
    }
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-5 pb-16">
        <div className="paper-card h-96 animate-pulse" />
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-5 pb-16">
      <form onSubmit={handleSave}>
        <div className="paper-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
            <span className="w-2.5 h-2.5 rounded-full bg-peach" />
            <span className="w-2.5 h-2.5 rounded-full bg-butter" />
            <span className="w-2.5 h-2.5 rounded-full bg-mint" />
            <span className="ml-2 text-xs text-muted-foreground">
              {isNew ? "New note" : "Editing note"}
            </span>
          </div>

          <div className="p-6">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              required
              maxLength={200}
              className="w-full font-display text-2xl font-semibold bg-transparent focus:outline-none mb-3"
            />
            <div className="h-px bg-border mb-4" />

            <div className="grid gap-3 sm:grid-cols-2 mb-4">
              <label className="grid gap-1 text-sm" htmlFor="note-tags">
                <span>Tags</span>
                <input
                  id="note-tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Separated by commas"
                  className="rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:outline-none"
                />
              </label>
              <label className="grid gap-1 text-sm" htmlFor="note-category">
                <span>Category</span>
                <input
                  id="note-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Category"
                  maxLength={100}
                  className="rounded-xl border border-border bg-transparent px-3 py-2 text-sm focus:outline-none"
                />
              </label>
            </div>

            <div className="flex gap-5 mb-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                />{" "}
                Pin note
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isArchived}
                  onChange={(e) => setIsArchived(e.target.checked)}
                />{" "}
                Archive note
              </label>
            </div>

            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-destructive text-sm mt-3">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 mt-5">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-primary text-primary-foreground font-semibold px-6 py-2.5 shadow-(--shadow-soft) disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save note"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-2xl border border-border font-semibold px-6 py-2.5"
          >
            Back to notes
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              className="ml-auto text-sm text-muted-foreground hover:text-destructive"
            >
              Delete note
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
