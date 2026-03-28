import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

jest.mock('../../apis/movieApis', () => ({
  searchMovies: jest.fn(),
}));

const { searchMovies } = require('../../apis/movieApis');

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

const mockMoviesResponse = {
  data: {
    data: [
      {
        _id: '1',
        imdbID: 'tt0001',
        title: 'Batman Begins',
        year: '2005',
        rating: 8.2,
        poster: 'https://example.com/batman.jpg',
        genre: ['Action', 'Adventure'],
      },
      {
        _id: '2',
        imdbID: 'tt0002',
        title: 'The Dark Knight',
        year: '2008',
        rating: 9.0,
        poster: 'https://example.com/dk.jpg',
        genre: ['Action', 'Crime', 'Drama'],
      },
    ],
    totalPages: 2,
  },
};

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders hero heading', () => {
    renderHome();
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('Movies')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    renderHome();
    expect(screen.getByText(/explore thousands/i)).toBeInTheDocument();
  });

  it('renders search bar', () => {
    renderHome();
    expect(screen.getByPlaceholderText(/search movies/i)).toBeInTheDocument();
  });

  it('does not show genre filter initially', () => {
    renderHome();
    expect(screen.queryByText('Filter by Genre')).not.toBeInTheDocument();
  });

  it('does not show pagination initially', () => {
    renderHome();
    expect(screen.queryByText('Prev')).not.toBeInTheDocument();
  });

  it('fetches movies after typing and debounce', async () => {
    searchMovies.mockResolvedValueOnce(mockMoviesResponse);
    renderHome();

    fireEvent.change(screen.getByPlaceholderText(/search movies/i), {
      target: { value: 'batman' },
    });

    // Advance past debounce
    act(() => { jest.advanceTimersByTime(500); });

    await waitFor(() => {
      expect(searchMovies).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'batman', page: 1, limit: 8 })
      );
    });
  });

  it('displays movie cards after search', async () => {
    searchMovies.mockResolvedValueOnce(mockMoviesResponse);
    renderHome();

    fireEvent.change(screen.getByPlaceholderText(/search movies/i), {
      target: { value: 'batman' },
    });
    act(() => { jest.advanceTimersByTime(500); });

    await waitFor(() => {
      expect(screen.getByText('Batman Begins')).toBeInTheDocument();
      expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
    });
  });

  it('shows genre filter buttons after search', async () => {
    searchMovies.mockResolvedValueOnce(mockMoviesResponse);
    renderHome();

    fireEvent.change(screen.getByPlaceholderText(/search movies/i), {
      target: { value: 'batman' },
    });
    act(() => { jest.advanceTimersByTime(500); });

    await waitFor(() => {
      expect(screen.getByText('Filter by Genre')).toBeInTheDocument();
      // Genre filter buttons exist (there may be multiple "Action" texts from cards + filter)
      expect(screen.getAllByText('Action').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Adventure').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows pagination when movies exist', async () => {
    searchMovies.mockResolvedValueOnce(mockMoviesResponse);
    renderHome();

    fireEvent.change(screen.getByPlaceholderText(/search movies/i), {
      target: { value: 'batman' },
    });
    act(() => { jest.advanceTimersByTime(500); });

    await waitFor(() => {
      expect(screen.getByText('Prev')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });
  });

  it('disables Prev button on first page', async () => {
    searchMovies.mockResolvedValueOnce(mockMoviesResponse);
    renderHome();

    fireEvent.change(screen.getByPlaceholderText(/search movies/i), {
      target: { value: 'batman' },
    });
    act(() => { jest.advanceTimersByTime(500); });

    await waitFor(() => {
      expect(screen.getByText('Prev')).toBeDisabled();
    });
  });

  it('shows error on API failure', async () => {
    searchMovies.mockRejectedValueOnce(new Error('API error'));
    renderHome();

    fireEvent.change(screen.getByPlaceholderText(/search movies/i), {
      target: { value: 'test' },
    });
    act(() => { jest.advanceTimersByTime(500); });

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch movies/i)).toBeInTheDocument();
    });
  });

  it('clears movies when search is emptied', async () => {
    searchMovies.mockResolvedValueOnce(mockMoviesResponse);
    renderHome();

    const input = screen.getByPlaceholderText(/search movies/i);
    fireEvent.change(input, { target: { value: 'batman' } });
    act(() => { jest.advanceTimersByTime(500); });

    await waitFor(() => {
      expect(screen.getByText('Batman Begins')).toBeInTheDocument();
    });

    fireEvent.change(input, { target: { value: '' } });
    act(() => { jest.advanceTimersByTime(500); });

    await waitFor(() => {
      expect(screen.queryByText('Batman Begins')).not.toBeInTheDocument();
    });
  });
});
