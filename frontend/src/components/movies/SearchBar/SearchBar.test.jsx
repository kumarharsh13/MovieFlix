import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from './SearchBar';

describe('SearchBar', () => {
  it('renders the search input', () => {
    render(<SearchBar searchTerm="" setSearchTerm={() => {}} />);
    expect(screen.getByPlaceholderText(/search movies/i)).toBeInTheDocument();
  });

  it('displays the current search term value', () => {
    render(<SearchBar searchTerm="batman" setSearchTerm={() => {}} />);
    expect(screen.getByDisplayValue('batman')).toBeInTheDocument();
  });

  it('calls setSearchTerm on input change', () => {
    const mockSet = jest.fn();
    render(<SearchBar searchTerm="" setSearchTerm={mockSet} />);
    fireEvent.change(screen.getByPlaceholderText(/search movies/i), {
      target: { value: 'inception' },
    });
    expect(mockSet).toHaveBeenCalledWith('inception');
  });

  it('has the correct aria-label for accessibility', () => {
    render(<SearchBar searchTerm="" setSearchTerm={() => {}} />);
    expect(screen.getByLabelText('Search movies')).toBeInTheDocument();
  });

  it('handles null searchTerm gracefully', () => {
    render(<SearchBar searchTerm={null} setSearchTerm={() => {}} />);
    expect(screen.getByPlaceholderText(/search movies/i)).toHaveValue('');
  });

  it('logs error if setSearchTerm throws', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const throwingFn = () => { throw new Error('fail'); };
    render(<SearchBar searchTerm="" setSearchTerm={throwingFn} />);
    fireEvent.change(screen.getByPlaceholderText(/search movies/i), {
      target: { value: 'x' },
    });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
