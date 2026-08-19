import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initial = user?.name?.charAt(0).toUpperCase() || '?';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <main className="max-w-2xl mx-auto px-5 pb-16">
      <div className="paper-card overflow-hidden">
        <div className="h-24 bg-lilac" />
        <div className="px-8 pb-8">
          <div className="w-20 h-20 -mt-10 rounded-full bg-butter flex items-center justify-center border-4 border-card">
            <span className="font-display text-3xl font-semibold">{initial}</span>
          </div>

          <h1 className="font-display text-2xl font-semibold mt-4">{user?.name}</h1>
          <p className="text-muted-foreground">{user?.email}</p>

          <div className="mt-6 space-y-2">
            <div className="bg-muted rounded-2xl px-4 py-3 flex justify-between">
              <span className="text-muted-foreground text-sm">Name</span>
              <span className="font-semibold">{user?.name}</span>
            </div>
            <div className="bg-muted rounded-2xl px-4 py-3 flex justify-between">
              <span className="text-muted-foreground text-sm">Email</span>
              <span className="font-semibold">{user?.email}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full mt-6 rounded-2xl bg-peach font-semibold py-3"
          >
            Log out
          </button>
        </div>
      </div>
    </main>
  );
}
