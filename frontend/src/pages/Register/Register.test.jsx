import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';

jest.mock('../../apis/authApi', () => ({
  registerUser: jest.fn(),
}));

const { registerUser } = require('../../apis/authApi');

const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

const fillForm = (email = 'test@test.com', password = '123456') => {
  fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
    target: { value: email },
  });
  fireEvent.change(screen.getByPlaceholderText('Min. 6 characters'), {
    target: { value: password },
  });
};

describe('Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders heading and subtitle', () => {
    renderRegister();
    expect(screen.getByText('Create account')).toBeInTheDocument();
    expect(screen.getByText('Join MovieFlix today')).toBeInTheDocument();
  });

  it('renders email and password inputs', () => {
    renderRegister();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min. 6 characters')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderRegister();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    renderRegister();
    expect(screen.getByText('Sign in')).toHaveAttribute('href', '/login');
  });

  it('shows error when email is empty', async () => {
    renderRegister();
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('shows error for invalid email format', async () => {
    renderRegister();
    fillForm('notanemail', '123456');
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  it('shows error when password is empty', async () => {
    renderRegister();
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('shows error for short password', async () => {
    renderRegister();
    fillForm('test@test.com', '123');
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('calls registerUser with valid form data', async () => {
    registerUser.mockResolvedValueOnce({});
    renderRegister();
    fillForm('test@test.com', '123456');
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: '123456',
      });
    });
  });

  it('shows loading state during submission', async () => {
    registerUser.mockImplementation(() => new Promise(() => {}));
    renderRegister();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });
  });

  it('shows API error message on failure', async () => {
    registerUser.mockRejectedValueOnce({
      response: { data: { message: 'Email already exists' } },
    });
    renderRegister();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  it('clears error when user types', async () => {
    renderRegister();
    // Trigger validation error
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
    // Type in email - error should clear
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 't' },
    });
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
  });

  it('disables inputs while loading', async () => {
    registerUser.mockImplementation(() => new Promise(() => {}));
    renderRegister();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('you@example.com')).toBeDisabled();
      expect(screen.getByPlaceholderText('Min. 6 characters')).toBeDisabled();
    });
  });
});
