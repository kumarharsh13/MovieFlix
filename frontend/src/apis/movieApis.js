import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helper to wrap API calls with error handling
const handleRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return response;
  } catch (error) {
    // Extract error message from response or fallback
    throw error.response?.data || { message: "Server error" };
  }
};

export const searchMovies = (params) =>
  handleRequest(() => api.get("/movies", { params }));

export const getMovieDetails = (id) =>
  handleRequest(() => api.get(`/movies/${id}`));

export const loginUser = (credentials) =>
  handleRequest(() => api.post("/auth/login", credentials));

export const getGenreStats = () =>
  handleRequest(() => api.get("/stats/genres"));

export const getRatingStats = () =>
  handleRequest(() => api.get("/stats/ratings"));

export const getRuntimeStats = () =>
  handleRequest(() => api.get("/stats/runtime"));

export const getMovieStats = () =>
  handleRequest(() => api.get("/movies/stats"));

export default api;
