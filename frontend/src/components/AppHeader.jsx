import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppHeader() {
  const location = useLocation();
  const { logout } = useAuth();

  const linkClass = (path) =>
    `px-4 py-1.5 rounded-full text-sm font-semibold transition ${
      location.pathname === path
        ? "bg-mint text-foreground"
        : "text-muted-foreground hover:bg-muted"
    }`;

  return (
    <header className="flex items-center justify-between max-w-4xl mx-auto px-5 py-6">
      <Link to="/dashboard" className="flex items-center gap-2">
        <span className="w-9 h-9 flex items-center justify-center rounded-2xl bg-lilac text-lg">
          🪶
        </span>
        <span className="font-display text-xl font-semibold">Scribble Pal</span>
      </Link>
      <nav className="flex items-center gap-1">
        <Link to="/dashboard" className={linkClass("/dashboard")}>
          Notes
        </Link>
        <Link to="/profile" className={linkClass("/profile")}>
          Profile
        </Link>
        <button
          type="button"
          onClick={logout}
          className="px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          Log out
        </button>
      </nav>
    </header>
  );
}
