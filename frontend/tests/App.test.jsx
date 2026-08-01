import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App.jsx';

describe('App routing scaffold', () => {
  it('redirects the default route to /login and renders the Login page', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
  });
});
