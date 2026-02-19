import { Link } from "react-router-dom";
import { useState } from "react";

function Home() {
  // Temporary local auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>BIG FIVE BOOKINGS</h1>
        <p style={styles.subtitle}>
          Hotel & Client Automation System 2025
        </p>

        {/* Auth Buttons */}
        {!isLoggedIn && (
          <div style={styles.buttonContainer}>
            <Link to="/register" style={styles.link}>
              <button style={styles.button}>Register</button>
            </Link>
            <Link to="/login" style={styles.link}>
              <button style={styles.button}>Login</button>
            </Link>
          </div>
        )}

        {/* Booking Management Buttons (only show after login) */}
        {isLoggedIn && (
          <div style={styles.buttonContainer}>
            <Link to="/add-client" style={styles.link}>
              <button style={styles.button}>Add Client</button>
            </Link>
            <Link to="/add-hotel" style={styles.link}>
              <button style={styles.button}>Add Hotel</button>
            </Link>
            <Link to="/create-booking" style={styles.link}>
              <button style={styles.button}>Create Booking</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Responsive Styles
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f9",
    padding: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "40px 30px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "100%",
    maxWidth: "400px",
    boxSizing: "border-box",
  },
  title: {
    marginBottom: "10px",
    color: "#1a1a1a",
    fontSize: "1.8rem",
  },
  subtitle: {
    marginBottom: "30px",
    color: "#666",
    fontSize: "1rem",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#1e88e5",
    color: "white",
    fontWeight: "bold",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
  },
  buttonDisabled: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#cccccc",
    color: "#555",
    fontSize: "1rem",
  },
  link: {
    textDecoration: "none",
  },
};

// Media Queries using JS
if (window.innerWidth < 500) {
  styles.card.padding = "30px 20px";
  styles.title.fontSize = "1.5rem";
  styles.subtitle.fontSize = "0.9rem";
  styles.button.fontSize = "0.9rem";
}

export default Home;
