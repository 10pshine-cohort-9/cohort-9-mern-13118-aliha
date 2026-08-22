import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NotebookDoodle } from "../components/Doodles";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center px-6">
      <div className="max-w-4xl w-full mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div className="hidden md:flex flex-col items-center gap-6">
          <NotebookDoodle />
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold">
              A soft place for loud thoughts
            </h2>
            <p className="text-muted-foreground mt-2">
              Write, keep and revisit your notes. Everything you write stays
              yours alone.
            </p>
          </div>
        </div>

        <div className="paper-card p-8">
          <h1 className="font-display text-3xl font-semibold">
            Create your account
          </h1>
          <p className="text-muted-foreground mt-1 mb-6">
            Takes about a minute.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold mb-1"
              >
                Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-2xl bg-muted border border-border px-4 py-3 focus:outline-none focus:bg-card focus:border-primary"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl bg-muted border border-border px-4 py-3 focus:outline-none focus:bg-card focus:border-primary"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-2xl bg-muted border border-border px-4 py-3 focus:outline-none focus:bg-card focus:border-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                At least 8 characters.
              </p>
            </div>
            {error && (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-primary text-primary-foreground font-semibold py-3 shadow-[var(--shadow-soft)] disabled:opacity-60"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-lilac underline font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
