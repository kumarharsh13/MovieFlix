import { useEffect, useState } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import { getMovieStats } from "../../apis/movieApis";

import styles from "./StatsDashboard.module.css";

Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMovieStats();
      if (!res?.data) {
        throw new Error("No data received from server");
      }
      setStats(res.data);
    } catch (err) {
      // Check for common errors
      if (err.response) {
        // Server responded with an error status
        if (err.response.status === 401 || err.response.status === 403) {
          setError(
            "Unauthorized access. Only admins can view the stats. Please login with appropriate credentials."
          );
        } else {
          setError(
            err.response.data?.message ||
              `Server error: ${err.response.statusText}`
          );
        }
      } else if (err.request) {
        // Request made but no response received
        setError(
          "Network error: Unable to connect to the server. Please check your connection."
        );
      } else {
        // Other errors
        setError(err.message || "Failed to load stats.");
      }
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <p>Loading stats...</p>;
  if (error)
    return (
      <div className={styles.errorContainer}>
        <p className={styles.error}>{error}</p>
        <button onClick={fetchStats} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  if (!stats) return <p>No statistics data available.</p>;

  // Guard against empty genreDistribution
  const genreDistribution = Array.isArray(stats.genreDistribution)
    ? stats.genreDistribution
    : [];

  if (genreDistribution.length === 0) {
    return <p>No genre distribution data available.</p>;
  }

  // Pie chart for genre distribution
  const genreLabels = genreDistribution.map((g) => g._id);
  const genreCounts = genreDistribution.map((g) => g.count);

  const pieData = {
    labels: genreLabels,
    datasets: [
      {
        label: "Genres Distribution",
        data: genreCounts,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#8BC34A",
          "#FF5722",
          "#607D8B",
          "#795548",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart for average ratings by genre (using overall average here)
  const averageRating = Number(stats.averageRating);
  const barData = {
    labels: ["Average Rating"],
    datasets: [
      {
        label: "Rating",
        data: [isNaN(averageRating) ? 0 : averageRating.toFixed(2)],
        backgroundColor: "#36A2EB",
      },
    ],
  };

  // Guard line chart data
  const avgRuntimeByYear = Array.isArray(stats.averageRuntimeByYear)
    ? stats.averageRuntimeByYear
    : [];

  if (avgRuntimeByYear.length === 0) {
    return <p>No average runtime data available.</p>;
  }

  const lineLabels = avgRuntimeByYear.map((item) => item._id);
  const lineDataPoints = avgRuntimeByYear.map((item) =>
    Number(item.avgRuntime.toFixed(2))
  );

  const lineData = {
    labels: lineLabels,
    datasets: [
      {
        label: "Average Runtime (minutes)",
        data: lineDataPoints,
        fill: false,
        borderColor: "#FF6384",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className={styles.container}>
      <h2>Movie Statistics Dashboard</h2>
      <div className={styles.charts}>
        <section className={styles.chart}>
          <h3>Genres Distribution</h3>
          <Pie data={pieData} />
        </section>

        <section className={styles.chart}>
          <h3>Average Movie Rating</h3>
          <Bar data={barData} options={{ scales: { y: { min: 0, max: 10 } } }} />
        </section>

        <section className={styles.chart}>
          <h3>Average Runtime by Year</h3>
          <Line data={lineData} />
        </section>
      </div>
    </div>
  );
};

export default StatsDashboard;
