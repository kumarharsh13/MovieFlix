import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import Navbar from './Navbar';

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    </MemoryRouter>
  );

describe('Navbar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders MovieFlix logo', () => {
    renderNavbar();
    expect(screen.getByText('MovieFlix')).toBeInTheDocument();
  });

  it('renders Home link', () => {
    renderNavbar();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('shows Login link when not logged in', () => {
    renderNavbar();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('hides Stats link when not logged in', () => {
    renderNavbar();
    expect(screen.queryByText('Stats')).not.toBeInTheDocument();
  });

  it('shows Logout button and Stats link when logged in', () => {
    localStorage.setItem('token', 'test-token');
    renderNavbar();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('clicking Logout clears token', () => {
    localStorage.setItem('token', 'test-token');
    renderNavbar();
    fireEvent.click(screen.getByText('Logout'));
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('logo links to home', () => {
    renderNavbar();
    const logo = screen.getByText('MovieFlix');
    expect(logo.closest('a')).toHaveAttribute('href', '/');
  });

  it('Home link points to /', () => {
    renderNavbar();
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
  });
});
