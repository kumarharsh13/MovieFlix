import { useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layouts/NavBar/Navbar';
import Home from './pages/Home/Home';
import MovieDetails from './pages/MovieDetails/MovieDetails';
import ProtectedRoute from './routes/ProtectedRoute';
import StatsDashboard from './pages/StatsDashboard/StatsDashboard';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import './App.css';

function App() {
  const glowRef = useRef(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let mouseX = 0;
    let mouseY = 0;
    let curX = 0;
    let curY = 0;
    let animId;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY + window.scrollY;
    };

    const animate = () => {
      // Smooth lerp follow
      curX += (mouseX - curX) * 0.08;
      curY += (mouseY - curY) * 0.08;
      glow.style.transform = `translate(${curX - 300}px, ${curY - 300}px)`;
      animId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <AuthProvider>
      {/* Mouse-following glow orb */}
      <div ref={glowRef} className="mouse-glow" aria-hidden="true" />
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
