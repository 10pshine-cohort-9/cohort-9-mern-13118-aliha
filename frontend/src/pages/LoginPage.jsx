import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotebookDoodle, BackdropBlobs } from '../components/Doodles';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center px-6">
      <BackdropBlobs />
      <div className="max-w-4xl w-full mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div className="hidden md:flex flex-col items-center gap-6">
          <NotebookDoodle />
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold">A quiet corner for your thoughts</h2>
            <p className="text-muted-foreground mt-2">
              Soft, simple and completely private. Only you can read what you write here.
            </p>
          </div>
        </div>

        <div className="paper-card p-8">
          <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
          <p className="text-muted-foreground mt-1 mb-6">Pick up right where you left off.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-1">
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
              <label htmlFor="password" className="block text-sm font-semibold mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl bg-muted border border-border px-4 py-3 focus:outline-none focus:bg-card focus:border-primary"
              />
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
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            New here?{' '}
            <Link to="/signup" className="text-lilac underline font-semibold">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
