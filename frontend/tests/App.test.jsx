import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App.jsx';

function renderAtRoute(path) {
  window.history.pushState({}, '', path);
  return render(<App />);
}

function loginAs(user) {
  localStorage.setItem('token', 'fake-token');
  localStorage.setItem('user', JSON.stringify(user));
}

afterEach(() => {
  localStorage.clear();
});

describe('App routing', () => {
  it('redirects the default route to /login', () => {
    renderAtRoute('/');
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('renders signup page', () => {
    renderAtRoute('/signup');
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
  });

  it('redirects to login when visiting a protected route while logged out', () => {
    renderAtRoute('/dashboard');
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('renders dashboard when logged in', () => {
    loginAs({ name: 'Ada', email: 'ada@example.com' });
    renderAtRoute('/dashboard');
    expect(screen.getByRole('heading', { name: /your notes/i })).toBeInTheDocument();
  });

  it('renders profile when logged in', () => {
    loginAs({ name: 'Ada', email: 'ada@example.com' });
    renderAtRoute('/profile');
    expect(screen.getByRole('heading', { name: /ada/i })).toBeInTheDocument();
    expect(screen.getAllByText(/ada@example.com/i).length).toBeGreaterThan(0);
  });
});
