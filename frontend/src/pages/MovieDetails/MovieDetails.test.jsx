import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MovieDetails from './MovieDetails';

jest.mock('../../apis/movieApis', () => ({
  getMovieDetails: jest.fn(),
}));

const { getMovieDetails } = require('../../apis/movieApis');

const mockMovie = {
  title: 'Inception',
  year: '2010',
  poster: 'https://example.com/poster.jpg',
  rating: 8.8,
  genre: ['Sci-Fi', 'Action'],
  director: 'Christopher Nolan',
  actors: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt'],
  runtime: 148,
  plot: 'A mind-bending thriller.',
  imdbLink: 'https://imdb.com/title/tt1375666',
};

const renderDetails = (id = 'tt1234') =>
  render(
    <MemoryRouter initialEntries={[`/movies/${id}`]}>
      <Routes>
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('MovieDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    getMovieDetails.mockImplementation(() => new Promise(() => {}));
    renderDetails();
    expect(screen.getByText(/loading movie details/i)).toBeInTheDocument();
  });

  it('renders movie details on success', async () => {
    getMovieDetails.mockResolvedValueOnce({ data: mockMovie });
    renderDetails();

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });
    expect(screen.getByText('2010')).toBeInTheDocument();
    expect(screen.getByText('Christopher Nolan')).toBeInTheDocument();
    expect(screen.getByText(/Leonardo DiCaprio/)).toBeInTheDocument();
    expect(screen.getByText('148 min')).toBeInTheDocument();
    expect(screen.getByText('A mind-bending thriller.')).toBeInTheDocument();
    expect(screen.getByText(/Sci-Fi, Action/)).toBeInTheDocument();
  });

  it('renders rating', async () => {
    getMovieDetails.mockResolvedValueOnce({ data: mockMovie });
    renderDetails();
    await waitFor(() => {
      expect(screen.getByText(/8\.8/)).toBeInTheDocument();
    });
  });

  it('renders poster image', async () => {
    getMovieDetails.mockResolvedValueOnce({ data: mockMovie });
    renderDetails();
    await waitFor(() => {
      const img = screen.getByAltText('Inception');
      expect(img).toHaveAttribute('src', mockMovie.poster);
    });
  });

  it('renders IMDb link', async () => {
    getMovieDetails.mockResolvedValueOnce({ data: mockMovie });
    renderDetails();
    await waitFor(() => {
      const link = screen.getByText(/view on imdb/i);
      expect(link).toHaveAttribute('href', mockMovie.imdbLink);
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  it('renders back to search link', async () => {
    getMovieDetails.mockResolvedValueOnce({ data: mockMovie });
    renderDetails();
    await waitFor(() => {
      expect(screen.getByText(/back to search/i)).toBeInTheDocument();
    });
  });

  it('hides IMDb link when not available', async () => {
    getMovieDetails.mockResolvedValueOnce({
      data: { ...mockMovie, imdbLink: null },
    });
    renderDetails();
    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });
    expect(screen.queryByText(/view on imdb/i)).not.toBeInTheDocument();
  });

  it('shows error on API failure', async () => {
    getMovieDetails.mockRejectedValueOnce({
      message: 'Something went wrong',
    });
    renderDetails();
    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  it('shows retry button on error', async () => {
    getMovieDetails.mockRejectedValueOnce({ message: 'Failed' });
    renderDetails();
    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('retries fetch on clicking Try Again', async () => {
    getMovieDetails.mockRejectedValueOnce({ message: 'Failed' });
    renderDetails();

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    getMovieDetails.mockResolvedValueOnce({ data: mockMovie });
    fireEvent.click(screen.getByText('Try Again'));

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });
    expect(getMovieDetails).toHaveBeenCalledTimes(2);
  });

  it('hides rating row when rating is null', async () => {
    getMovieDetails.mockResolvedValueOnce({
      data: { ...mockMovie, rating: null },
    });
    renderDetails();
    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });
    expect(screen.queryByText('Rating')).not.toBeInTheDocument();
  });

  it('calls getMovieDetails with correct id', async () => {
    getMovieDetails.mockResolvedValueOnce({ data: mockMovie });
    renderDetails('tt9999');
    await waitFor(() => {
      expect(getMovieDetails).toHaveBeenCalledWith('tt9999');
    });
  });
});
