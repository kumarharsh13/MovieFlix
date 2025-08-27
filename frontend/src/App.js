import { Routes, Route } from 'react-router-dom'; 
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layouts/NavBar/Navbar';
import Home from './pages/Home/Home';
import MovieDetails from './pages/MovieDetails/MovieDetails';
import ProtectedRoute from './routes/ProtectedRoute';
import StatsDashboard from './pages/StatsDashboard/StatsDashboard';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <StatsDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
