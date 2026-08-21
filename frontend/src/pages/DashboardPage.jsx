import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import apiClient from "../services/apiClient";
import { EmptyDoodle } from "../components/Doodles";
import { extractText } from "../lib/tiptapText";

const TINTS = [
  "bg-mint",
  "bg-peach",
  "bg-butter",
  "bg-sky",
  "bg-lilac",
  "bg-blush",
];

function NoteCard({ note, tint, onDelete, onTogglePin, onArchive }) {
  const preview = extractText(note.content);
  return (
    <div className="paper-card lift-shadow transition overflow-hidden">
      <div className={`h-1.5 ${tint}`} />
      <div className="p-5">
        <Link to={`/notes/${note.id}`} className="block">
          <h3 className="font-display text-lg font-semibold">{note.title}</h3>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-3">
            {preview}
          </p>
        </Link>
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>
            {note.is_pinned ? "Pinned · " : ""}Edited{" "}
            {new Date(note.updated_at).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onTogglePin(note)}
              className="hover:text-foreground"
            >
              {note.is_pinned ? "Unpin" : "Pin"}
            </button>
            <button
              type="button"
              onClick={() => onArchive(note.id)}
              className="hover:text-foreground"
              hidden={note.is_archived}
            >
              Archive
            </button>
            <button
              type="button"
              onClick={() => onDelete(note.id)}
              className="hover:text-destructive"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

NoteCard.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.shape({ text: PropTypes.string }),
    updated_at: PropTypes.string.isRequired,
    is_pinned: PropTypes.bool,
  }).isRequired,
  tint: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onTogglePin: PropTypes.func.isRequired,
  onArchive: PropTypes.func.isRequired,
};

export default function DashboardPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [category, setCategory] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const categories = useMemo(
    () =>
      [...new Set(notes.map((note) => note.category).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b),
      ),
    [notes],
  );

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setError("");

    apiClient
      .get("/notes", {
        params: {
          q: search || undefined,
          tag: tag || undefined,
          category: category || undefined,
          archived: showArchived || undefined,
        },
      })
      .then((res) => {
        if (isActive) setNotes(res.data.data.notes);
      })
      .catch(() => {
        if (isActive) setError("Could not load notes");
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [search, tag, category, showArchived]);

  async function handleDelete(id) {
    if (!window.confirm("Delete this note?")) return;

    try {
      await apiClient.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      setError("Could not delete note");
    }
  }

  async function handleTogglePin(note) {
    try {
      const { data } = await apiClient.put(`/notes/${note.id}`, {
        is_pinned: !note.is_pinned,
      });
      setNotes((prev) =>
        prev.map((item) => (item.id === note.id ? data.data.note : item)),
      );
    } catch {
      setError("Could not update note");
    }
  }

  async function handleArchive(id) {
    try {
      await apiClient.put(`/notes/${id}`, { is_archived: true });
      if (!showArchived) {
        setNotes((prev) => prev.filter((note) => note.id !== id));
      }
    } catch {
      setError("Could not archive note");
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-5 pb-16">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold">Your notes</h1>
          <p className="text-muted-foreground mt-1">
            {notes.length} note{notes.length === 1 ? "" : "s"} kept safely for
            you.
          </p>
        </div>
        <Link
          to="/notes/new"
          className="rounded-full bg-primary text-primary-foreground font-semibold px-5 py-2.5 shadow-(--shadow-soft)"
        >
          + New note
        </Link>
      </div>

      <div className="paper-card p-4 mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title or content"
          className="rounded-xl border border-border bg-transparent px-3 py-2 focus:outline-none"
        />
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value.toLowerCase())}
          placeholder="Filter by tag"
          className="rounded-xl border border-border bg-transparent px-3 py-2 focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-border bg-card px-3 py-2"
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm whitespace-nowrap">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          <span>Archived</span>
        </label>
      </div>

      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}

      {loading && (
        <div className="grid sm:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="paper-card h-32 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && notes.length === 0 && (
        <div className="paper-card p-10 text-center">
          <EmptyDoodle />
          <p className="text-muted-foreground mt-4">
            No notes yet. Start writing your first one.
          </p>
          <Link
            to="/notes/new"
            className="inline-block mt-4 rounded-full bg-mint px-5 py-2.5 font-semibold"
          >
            + New note
          </Link>
        </div>
      )}

      {!loading && notes.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-5">
          {notes.map((note, i) => (
            <NoteCard
              key={note.id}
              note={note}
              tint={TINTS[i % TINTS.length]}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}
    </main>
  );
}
