// src/apis/authApi.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
});

// Utility to wrap API calls with error handling
const handleRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return response;
  } catch (error) {
    // Re-throw the error with useful details for the UI
    throw error.response?.data || { message: 'Server error' };
  }
};

export const loginUser = (credentials) =>
  handleRequest(() => API.post('/auth/login', credentials));

export const registerUser = (credentials) =>
  handleRequest(() => API.post('/auth/register', credentials));
