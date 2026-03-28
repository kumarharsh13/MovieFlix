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
  Filler,
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
  Title,
  Filler
);

// Dark theme defaults
Chart.defaults.color = "#9a95a8";
Chart.defaults.borderColor = "rgba(255,255,255,0.05)";

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
      if (err.response) {
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
        setError(
          "Network error: Unable to connect to the server. Please check your connection."
        );
      } else {
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

  if (loading) return <p className={styles.loadingState}>Loading stats...</p>;
  if (error)
    return (
      <div className={styles.errorContainer}>
        <p className={styles.error}>{error}</p>
        <button onClick={fetchStats} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  if (!stats) return <p className={styles.loadingState}>No statistics data available.</p>;

  const genreDistribution = Array.isArray(stats.genreDistribution)
    ? stats.genreDistribution
    : [];

  if (genreDistribution.length === 0) {
    return <p className={styles.loadingState}>No genre distribution data available.</p>;
  }

  const genreLabels = genreDistribution.map((g) => g._id);
  const genreCounts = genreDistribution.map((g) => g.count);

  const chartColors = [
    "#e8a838", "#7c6aef", "#3ecfb2", "#e8647c", "#f0c060",
    "#6a9ef0", "#c084fc", "#34d399", "#f87171", "#fbbf24",
  ];

  const pieData = {
    labels: genreLabels,
    datasets: [
      {
        label: "Genres Distribution",
        data: genreCounts,
        backgroundColor: chartColors,
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const averageRating = Number(stats.averageRating);
  const barData = {
    labels: ["Average Rating"],
    datasets: [
      {
        label: "Rating",
        data: [isNaN(averageRating) ? 0 : averageRating.toFixed(2)],
        backgroundColor: "rgba(232, 168, 56, 0.3)",
        borderColor: "#e8a838",
        borderWidth: 1,
        borderRadius: 8,
        hoverBackgroundColor: "rgba(232, 168, 56, 0.5)",
      },
    ],
  };

  const avgRuntimeByYear = Array.isArray(stats.averageRuntimeByYear)
    ? stats.averageRuntimeByYear
    : [];

  if (avgRuntimeByYear.length === 0) {
    return <p className={styles.loadingState}>No average runtime data available.</p>;
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
        fill: true,
        backgroundColor: "rgba(124, 106, 239, 0.08)",
        borderColor: "#7c6aef",
        pointBackgroundColor: "#7c6aef",
        pointBorderColor: "transparent",
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className={styles.container}>
      <h2>Statistics</h2>
      <p className={styles.dashSubtitle}>Overview of movie data insights</p>
      <div className={styles.charts}>
        <section className={styles.chart}>
          <h3>Genre Distribution</h3>
          <Pie
            data={pieData}
            options={{
              plugins: {
                legend: { position: "bottom", labels: { padding: 16, usePointStyle: true, pointStyleWidth: 8 } },
              },
            }}
          />
        </section>

        <section className={styles.chart}>
          <h3>Average Movie Rating</h3>
          <Bar
            data={barData}
            options={{
              scales: { y: { min: 0, max: 10, grid: { color: "rgba(255,255,255,0.03)" } } },
              plugins: { legend: { display: false } },
            }}
          />
        </section>

        <section className={styles.chart}>
          <h3>Average Runtime by Year</h3>
          <Line
            data={lineData}
            options={{
              scales: {
                x: { grid: { display: false } },
                y: { grid: { color: "rgba(255,255,255,0.03)" } },
              },
              plugins: { legend: { display: false } },
            }}
          />
        </section>
      </div>
    </div>
  );
};

export default StatsDashboard;
