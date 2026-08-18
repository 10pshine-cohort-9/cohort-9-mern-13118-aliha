import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import apiClient from '../services/apiClient';
import { EmptyDoodle } from '../components/Doodles';
import { extractText } from '../lib/tiptapText';

const TINTS = ['bg-mint', 'bg-peach', 'bg-butter', 'bg-sky', 'bg-lilac', 'bg-blush'];

function NoteCard({ note, tint, onDelete }) {
  const preview = extractText(note.content);
  return (
    <div className="paper-card lift-shadow transition overflow-hidden">
      <div className={`h-1.5 ${tint}`} />
      <div className="p-5">
        <Link to={`/notes/${note.id}`} className="block">
          <h3 className="font-display text-lg font-semibold">{note.title}</h3>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-3">{preview}</p>
        </Link>
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>Edited {new Date(note.updated_at).toLocaleDateString()}</span>
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
  );
}

NoteCard.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.shape({ text: PropTypes.string }),
    updated_at: PropTypes.string.isRequired,
  }).isRequired,
  tint: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default function DashboardPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient
      .get('/notes')
      .then((res) => setNotes(res.data.data.notes))
      .catch(() => setError('Could not load notes'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this note?')) return;
    await apiClient.delete(`/notes/${id}`);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <main className="max-w-4xl mx-auto px-5 pb-16">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold">Your notes</h1>
          <p className="text-muted-foreground mt-1">
            {notes.length} note{notes.length === 1 ? '' : 's'} kept safely for you.
          </p>
        </div>
        <Link
          to="/notes/new"
          className="rounded-full bg-primary text-primary-foreground font-semibold px-5 py-2.5 shadow-[var(--shadow-soft)]"
        >
          + New note
        </Link>
      </div>

      {error && <p role="alert" className="text-destructive">{error}</p>}

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
          <p className="text-muted-foreground mt-4">No notes yet. Start writing your first one.</p>
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
            />
          ))}
        </div>
      )}
    </main>
  );
}
