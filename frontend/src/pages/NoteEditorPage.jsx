import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../services/apiClient';

export default function NoteEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;
    apiClient
      .get(`/notes/${id}`)
      .then((res) => {
        const note = res.data.data.note;
        setTitle(note.title);
        setText(note.content?.text || '');
      })
      .catch(() => setError('Note not found'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const content = { text };
    try {
      if (isNew) {
        await apiClient.post('/notes', { title, content });
      } else {
        await apiClient.put(`/notes/${id}`, { title, content });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save note');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this note?')) return;
    try {
      await apiClient.delete(`/notes/${id}`);
      navigate('/dashboard');
    } catch {
      setError('Could not delete note');
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <main>
      <h1>Note Editor</h1>
      <form onSubmit={handleSave}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
          />
        </div>
        <div>
          <label htmlFor="content">Content</label>
          <textarea id="content" value={text} onChange={(e) => setText(e.target.value)} rows={10} />
        </div>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={() => navigate('/dashboard')}>
          Cancel
        </button>
        {!isNew && (
          <button type="button" onClick={handleDelete}>
            Delete
          </button>
        )}
      </form>
    </main>
  );
}
