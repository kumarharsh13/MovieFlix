import { render, screen, fireEvent, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Test component that exposes auth state
const AuthConsumer = () => {
  const { token, isLoggedIn, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="token">{token || 'null'}</span>
      <span data-testid="logged-in">{isLoggedIn ? 'yes' : 'no'}</span>
      <button onClick={() => login('abc123')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

const renderAuth = () =>
  render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts logged out when no token in localStorage', () => {
    renderAuth();
    expect(screen.getByTestId('logged-in')).toHaveTextContent('no');
    expect(screen.getByTestId('token')).toHaveTextContent('null');
  });

  it('starts logged in when token exists in localStorage', () => {
    localStorage.setItem('token', 'existing-token');
    renderAuth();
    expect(screen.getByTestId('logged-in')).toHaveTextContent('yes');
    expect(screen.getByTestId('token')).toHaveTextContent('existing-token');
  });

  it('login sets the token', () => {
    renderAuth();
    fireEvent.click(screen.getByText('Login'));
    expect(screen.getByTestId('token')).toHaveTextContent('abc123');
    expect(screen.getByTestId('logged-in')).toHaveTextContent('yes');
  });

  it('login persists token to localStorage', () => {
    renderAuth();
    fireEvent.click(screen.getByText('Login'));
    expect(localStorage.getItem('token')).toBe('abc123');
  });

  it('logout clears the token', () => {
    localStorage.setItem('token', 'some-token');
    renderAuth();
    fireEvent.click(screen.getByText('Logout'));
    expect(screen.getByTestId('token')).toHaveTextContent('null');
    expect(screen.getByTestId('logged-in')).toHaveTextContent('no');
  });

  it('logout removes token from localStorage', () => {
    localStorage.setItem('token', 'some-token');
    renderAuth();
    fireEvent.click(screen.getByText('Logout'));
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('useAuth throws when used outside AuthProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AuthConsumer />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    spy.mockRestore();
  });
});
