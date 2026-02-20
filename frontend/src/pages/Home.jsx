import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import { FaUserPlus, FaHotel, FaCalendarCheck, FaChartBar, FaBars } from "react-icons/fa";

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   setIsLoggedIn(!!token);
  // }, []);
  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  setIsLoggedIn(!!user?.token);
}, []);


  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   setIsLoggedIn(false);
  // };
  const handleLogout = () => {
  localStorage.removeItem("user");
  setIsLoggedIn(false);
};


  return (
    <div style={styles.page}>
      {/* ================= HEADER ================= */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <img src={logo} alt="Big Five Logo" style={styles.logoImg} />
          <h2 style={styles.logo}>BIG FIVE BOOKINGS</h2>
        </div>

        <div style={{ ...styles.authArea, display: menuOpen ? "flex" : "flex" }}>
          {!isLoggedIn ? (
            <>
              <Link to="/login" style={styles.headerBtn}>Login</Link>
              <Link to="/register" style={styles.headerBtnPrimary}>Register</Link>
            </>
          ) : (
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          )}
        </div>

        {/* Hamburger menu for mobile */}
        <button style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          <FaBars size={24} color="white" />
        </button>
      </header>

      {/* ================= MAIN ================= */}
      <main style={styles.main}>
        <div style={styles.welcomeCard}>
          <h1 style={styles.title}>Tour Operator Dashboard</h1>
          <p style={styles.subtitle}>
            Manage clients, hotels, bookings, and payments with elegance and ease.
          </p>

          {isLoggedIn ? (
            <div style={styles.grid}>
              <Link to="/add-client" style={styles.cardLink}>
                <div style={{ ...styles.actionCard, background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
                  <FaUserPlus style={styles.icon} /> Add Client
                </div>
              </Link>

              <Link to="/add-hotel" style={styles.cardLink}>
                <div style={{ ...styles.actionCard, background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" }}>
                  <FaHotel style={styles.icon} /> Add Hotel
                </div>
              </Link>

              <Link to="/create-booking" style={styles.cardLink}>
                <div style={{ ...styles.actionCard, background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" }}>
                  <FaCalendarCheck style={styles.icon} /> Create Booking
                </div>
              </Link>

              <Link to="/bookings" style={styles.cardLink}>
                <div style={{ ...styles.actionCard, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                  <FaChartBar style={styles.icon} /> View Bookings
                </div>
              </Link>
            </div>
          ) : (
            <p style={styles.loginNotice}>🔒 Please login to access the dashboard</p>
          )}
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer style={styles.footer}>
        © 2025 Big Five Tours — Premium Booking System
      </footer>
    </div>
  );
}

export default Home;

// ================= STYLES =================
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    transition: "all 0.3s ease",
  },

  /* HEADER */
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    background: "rgba(30,136,229,0.85)",
    color: "white",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255,255,255,0.3)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  logoImg: {
    width: "42px",
    height: "42px",
    objectFit: "contain",
  },

  logo: {
    margin: 0,
    fontSize: "clamp(0.9rem, 2vw, 1.25rem)",
    fontWeight: "bold",
    color: "white",
  },

  authArea: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  hamburger: {
    display: "none",
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },

  headerBtn: {
    padding: "8px 16px",
    background: "rgba(255,255,255,0.2)",
    border: "1px solid white",
    color: "white",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "0.9rem",
    transition: "all 0.2s",
    cursor: "pointer",
  },

  headerBtnPrimary: {
    padding: "8px 16px",
    background: "white",
    color: "#1e88e5",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  logoutBtn: {
    padding: "8px 16px",
    background: "#e53935",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  /* MAIN */
  main: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px 15px",
  },

  welcomeCard: {
    background: "rgba(255,255,255,0.7)",
    padding: "40px 30px",
    borderRadius: "20px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    backdropFilter: "blur(15px)",
    width: "100%",
    maxWidth: "900px",
    textAlign: "center",
    transition: "all 0.3s ease",
  },

  title: {
    marginBottom: "10px",
    color: "#1a1a1a",
    fontSize: "1.8rem",
  },

  subtitle: {
    marginBottom: "30px",
    color: "#444",
    fontSize: "1rem",
  },

  loginNotice: {
    color: "#e53935",
    fontWeight: "bold",
  },

  /* GRID */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },

  actionCard: {
    padding: "30px 20px",
    color: "white",
    borderRadius: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
    textAlign: "center",
    fontSize: "1.1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },

  icon: {
    fontSize: "1.8rem",
    transition: "transform 0.3s ease",
  },

  cardLink: {
    textDecoration: "none",
  },

  /* FOOTER */
  footer: {
    textAlign: "center",
    padding: "15px",
    background: "rgba(13,71,161,0.85)",
    color: "white",
    fontSize: "0.9rem",
    backdropFilter: "blur(8px)",
  },

  /* Responsive tweaks */
  "@media (max-width: 768px)": {
    hamburger: { display: "block" },
    authArea: { display: "none" },
  },
};

