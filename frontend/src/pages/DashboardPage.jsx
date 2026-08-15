import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get("/notes")
      .then((res) => setNotes(res.data.data.notes))
      .catch(() => setError("Could not load notes"))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <button type="button" onClick={handleLogout}>
        Log Out
      </button>
      <Link to="/notes/new">+ New Note</Link>

      {loading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}

      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <Link to={`/notes/${note.id}`}>{note.title}</Link>
          </li>
        ))}
      </ul>
      {!loading && !error && notes.length === 0 && <p>No notes yet.</p>}
    </main>
  );
}
