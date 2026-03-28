import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StatsDashboard from './StatsDashboard';

// Mock chart.js and react-chartjs-2
jest.mock('chart.js', () => ({
  Chart: { register: jest.fn(), defaults: { color: '', borderColor: '' } },
  ArcElement: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Filler: jest.fn(),
}));

jest.mock('react-chartjs-2', () => ({
  Pie: (props) => <div data-testid="pie-chart">{JSON.stringify(props.data.labels)}</div>,
  Bar: (props) => <div data-testid="bar-chart">{JSON.stringify(props.data.datasets[0].data)}</div>,
  Line: (props) => <div data-testid="line-chart">{JSON.stringify(props.data.labels)}</div>,
}));

jest.mock('../../apis/movieApis', () => ({
  getMovieStats: jest.fn(),
}));

const { getMovieStats } = require('../../apis/movieApis');

const mockStats = {
  genreDistribution: [
    { _id: 'Action', count: 10 },
    { _id: 'Drama', count: 8 },
    { _id: 'Comedy', count: 5 },
  ],
  averageRating: 7.5,
  averageRuntimeByYear: [
    { _id: 2020, avgRuntime: 120.5 },
    { _id: 2021, avgRuntime: 115.3 },
  ],
};

describe('StatsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    getMovieStats.mockImplementation(() => new Promise(() => {}));
    render(<StatsDashboard />);
    expect(screen.getByText(/loading stats/i)).toBeInTheDocument();
  });

  it('renders dashboard heading and subtitle', async () => {
    getMovieStats.mockResolvedValueOnce({ data: mockStats });
    render(<StatsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Statistics')).toBeInTheDocument();
      expect(screen.getByText(/overview of movie data/i)).toBeInTheDocument();
    });
  });

  it('renders all three chart sections', async () => {
    getMovieStats.mockResolvedValueOnce({ data: mockStats });
    render(<StatsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Genre Distribution')).toBeInTheDocument();
      expect(screen.getByText('Average Movie Rating')).toBeInTheDocument();
      expect(screen.getByText('Average Runtime by Year')).toBeInTheDocument();
    });
  });

  it('renders Pie chart with genre labels', async () => {
    getMovieStats.mockResolvedValueOnce({ data: mockStats });
    render(<StatsDashboard />);
    await waitFor(() => {
      const pie = screen.getByTestId('pie-chart');
      expect(pie).toHaveTextContent('Action');
      expect(pie).toHaveTextContent('Drama');
      expect(pie).toHaveTextContent('Comedy');
    });
  });

  it('renders Bar chart with average rating', async () => {
    getMovieStats.mockResolvedValueOnce({ data: mockStats });
    render(<StatsDashboard />);
    await waitFor(() => {
      const bar = screen.getByTestId('bar-chart');
      expect(bar).toHaveTextContent('7.50');
    });
  });

  it('renders Line chart with year labels', async () => {
    getMovieStats.mockResolvedValueOnce({ data: mockStats });
    render(<StatsDashboard />);
    await waitFor(() => {
      const line = screen.getByTestId('line-chart');
      expect(line).toHaveTextContent('2020');
      expect(line).toHaveTextContent('2021');
    });
  });

  it('shows error on API failure', async () => {
    getMovieStats.mockRejectedValueOnce({ message: 'Server down' });
    render(<StatsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Server down')).toBeInTheDocument();
    });
  });

  it('shows unauthorized error for 401', async () => {
    getMovieStats.mockRejectedValueOnce({
      response: { status: 401, data: {} },
    });
    render(<StatsDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/unauthorized access/i)).toBeInTheDocument();
    });
  });

  it('shows network error', async () => {
    getMovieStats.mockRejectedValueOnce({ request: {} });
    render(<StatsDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('shows retry button on error', async () => {
    getMovieStats.mockRejectedValueOnce({ message: 'Fail' });
    render(<StatsDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('retries fetch on clicking Try Again', async () => {
    getMovieStats.mockRejectedValueOnce({ message: 'Fail' });
    render(<StatsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    getMovieStats.mockResolvedValueOnce({ data: mockStats });
    fireEvent.click(screen.getByText('Try Again'));

    await waitFor(() => {
      expect(screen.getByText('Statistics')).toBeInTheDocument();
    });
    expect(getMovieStats).toHaveBeenCalledTimes(2);
  });

  it('handles empty genre distribution', async () => {
    getMovieStats.mockResolvedValueOnce({
      data: { ...mockStats, genreDistribution: [] },
    });
    render(<StatsDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/no genre distribution/i)).toBeInTheDocument();
    });
  });

  it('handles empty runtime data', async () => {
    getMovieStats.mockResolvedValueOnce({
      data: { ...mockStats, averageRuntimeByYear: [] },
    });
    render(<StatsDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/no average runtime/i)).toBeInTheDocument();
    });
  });
});
