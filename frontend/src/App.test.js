import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock all page components to isolate routing tests
jest.mock('./pages/Home/Home', () => () => <div>Home Page</div>);
jest.mock('./pages/Login/Login', () => () => <div>Login Page</div>);
jest.mock('./pages/Register/Register', () => () => <div>Register Page</div>);
jest.mock('./pages/MovieDetails/MovieDetails', () => () => <div>Movie Details Page</div>);
jest.mock('./pages/StatsDashboard/StatsDashboard', () => () => <div>Stats Page</div>);

// Wrap App with MemoryRouter for test control
const renderApp = (route = '/') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  );

// App uses BrowserRouter internally via AuthProvider/Navbar, but we override routing
// Actually App doesn't wrap in BrowserRouter itself (index.js does), so MemoryRouter works.

describe('App Routing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Navbar on all pages', () => {
    renderApp();
    expect(screen.getByText('MovieFlix')).toBeInTheDocument();
  });

  it('renders Home page on /', () => {
    renderApp('/');
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renders Login page on /login', () => {
    renderApp('/login');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders Register page on /register', () => {
    renderApp('/register');
    expect(screen.getByText('Register Page')).toBeInTheDocument();
  });

  it('renders MovieDetails page on /movies/:id', () => {
    renderApp('/movies/tt1234');
    expect(screen.getByText('Movie Details Page')).toBeInTheDocument();
  });

  it('redirects /dashboard to login when not authenticated', () => {
    renderApp('/dashboard');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Stats Page')).not.toBeInTheDocument();
  });

  it('shows Stats page on /dashboard when authenticated', () => {
    localStorage.setItem('token', 'test-token');
    renderApp('/dashboard');
    expect(screen.getByText('Stats Page')).toBeInTheDocument();
  });

  it('shows 404 for unknown routes', () => {
    renderApp('/unknown-route');
    expect(screen.getByText('404 Not Found')).toBeInTheDocument();
  });

  it('renders the mouse glow element', () => {
    renderApp();
    const glow = document.querySelector('.mouse-glow');
    expect(glow).toBeInTheDocument();
  });
});
