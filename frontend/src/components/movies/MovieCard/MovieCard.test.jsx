import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MovieCard from './MovieCard';

const renderCard = (movie) =>
  render(
    <MemoryRouter>
      <MovieCard movie={movie} />
    </MemoryRouter>
  );

const mockMovie = {
  _id: '1',
  imdbID: 'tt1234',
  title: 'Inception',
  year: '2010',
  rating: 8.8,
  poster: 'https://example.com/poster.jpg',
  genre: ['Sci-Fi', 'Action', 'Thriller'],
};

describe('MovieCard', () => {
  it('renders movie title', () => {
    renderCard(mockMovie);
    expect(screen.getByText('Inception')).toBeInTheDocument();
  });

  it('renders movie year', () => {
    renderCard(mockMovie);
    expect(screen.getByText('2010')).toBeInTheDocument();
  });

  it('renders rating badge', () => {
    renderCard(mockMovie);
    expect(screen.getByText(/8\.8/)).toBeInTheDocument();
  });

  it('renders genre tags (max 3)', () => {
    renderCard(mockMovie);
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Thriller')).toBeInTheDocument();
  });

  it('limits genre tags to 3', () => {
    const movie = { ...mockMovie, genre: ['A', 'B', 'C', 'D'] };
    renderCard(movie);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.queryByText('D')).not.toBeInTheDocument();
  });

  it('renders poster image with correct alt text', () => {
    renderCard(mockMovie);
    const img = screen.getByAltText('Inception Poster');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockMovie.poster);
  });

  it('shows "No Poster" when poster is missing', () => {
    renderCard({ ...mockMovie, poster: null });
    expect(screen.getByText('No Poster')).toBeInTheDocument();
  });

  it('renders View Details link with correct href', () => {
    renderCard(mockMovie);
    const link = screen.getByText(/view details/i);
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/movies/tt1234');
  });

  it('uses _id when imdbID is missing', () => {
    renderCard({ ...mockMovie, imdbID: null });
    const link = screen.getByText(/view details/i);
    expect(link.closest('a')).toHaveAttribute('href', '/movies/1');
  });

  it('shows fallback text when movie is null', () => {
    renderCard(null);
    expect(screen.getByText('No movie data available.')).toBeInTheDocument();
  });

  it('hides rating badge when rating is null', () => {
    renderCard({ ...mockMovie, rating: null });
    expect(screen.queryByText('★')).not.toBeInTheDocument();
  });

  it('handles empty genre array', () => {
    renderCard({ ...mockMovie, genre: [] });
    expect(screen.queryByText('Sci-Fi')).not.toBeInTheDocument();
  });

  it('uses default title when title is missing', () => {
    renderCard({ ...mockMovie, title: undefined });
    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });

  it('uses default year when year is missing', () => {
    renderCard({ ...mockMovie, year: undefined });
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('applies 3D tilt on mouse move and resets on leave', () => {
    renderCard(mockMovie);
    const card = screen.getByText('Inception').closest('[class]');
    // Simulate mouse events - should not throw
    fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });
    fireEvent.mouseLeave(card);
  });

  it('handles poster image error with fallback', () => {
    renderCard(mockMovie);
    const img = screen.getByAltText('Inception Poster');
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', '/fallback-poster.png');
  });
});
