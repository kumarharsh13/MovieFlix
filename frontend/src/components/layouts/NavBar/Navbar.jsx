import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useAuth } from "../../../contexts/AuthContext";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [error, setError] = useState(null);

  const handleLogout = () => {
    try {
      logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Failed to logout. Please try again.");
    }
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        MovieFlix
      </Link>
      <div className={styles.links}>
        <Link to="/">Home</Link>
        {isLoggedIn && <Link to="/dashboard">Stats</Link>}
        {!isLoggedIn ? (
          <Link to="/login">Login</Link>
        ) : (
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        )}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </nav>
  );
};

export default Navbar;
