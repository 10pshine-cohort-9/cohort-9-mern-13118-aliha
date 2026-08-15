import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../services/apiClient";

type NoteRecord = {
  id: number;
  title: string;
  content?: { text?: string } | null;
};

type NoteResponse = {
  data: {
    note: NoteRecord;
  };
};

type SavePayload = {
  title: string;
  content: { text: string };
};

type ApiError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
};

export default function NoteEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const isNew = !id;
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return undefined;
    }

    let ignore = false;
    setLoading(true);
    setError("");
    setTitle("");
    setText("");

    apiClient
      .get<NoteResponse>(`/notes/${id}`)
      .then((res) => {
        if (ignore) return;
        const note = res.data.data.note;
        setTitle(note.title);
        setText(note.content?.text || "");
        setError("");
      })
      .catch((err: ApiError) => {
        if (!ignore) {
          if (err.response?.status === 404) {
            setError("Note not found");
          } else {
            setError(err.response?.data?.message || "Could not load note");
          }
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id, isNew]);

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving || deleting) return;

    setError("");
    setSaving(true);
    const content = { text };

    try {
      const payload: SavePayload = { title, content };

      if (isNew) {
        await apiClient.post("/notes", payload);
      } else {
        await apiClient.put(`/notes/${id}`, payload);
      }
      navigate("/dashboard");
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || "Could not save note");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || saving || deleting || !window.confirm("Delete this note?"))
      return;

    setDeleting(true);
    setError("");

    try {
      await apiClient.delete(`/notes/${id}`);
      navigate("/dashboard");
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || "Could not delete note");
    } finally {
      setDeleting(false);
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
          <textarea
            id="content"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
          />
        </div>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={saving || deleting}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          disabled={saving || deleting}
        >
          Cancel
        </button>
        {!isNew && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving || deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </form>
    </main>
  );
}
