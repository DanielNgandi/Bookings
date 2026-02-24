import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import safariBg from "../assets/safari-bg.png"; 
import {
  FaUserPlus,
  FaHotel,
  FaCalendarCheck,
  FaChartBar,
  FaBars,
  FaTimes,
} from "react-icons/fa";

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(""); // ✅ user name state
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // ✅ login check and get user name
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) {
      setIsLoggedIn(true);
      setUserName(user.name || "User");
    } else {
      setIsLoggedIn(false);
      setUserName("");
    }
  }, []);

  // ✅ entrance animation
  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  // ✅ detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName("");
  };

  // ⭐ hover effects
  const handleHoverEnter = (e) => {
    if (isMobile) return;
    e.currentTarget.style.transform = "translateY(-6px) scale(1.03)";
    const icon = e.currentTarget.querySelector("svg");
    if (icon) icon.style.transform = "scale(1.2)";
  };

  const handleHoverLeave = (e) => {
    if (isMobile) return;
    e.currentTarget.style.transform = "translateY(0) scale(1)";
    const icon = e.currentTarget.querySelector("svg");
    if (icon) icon.style.transform = "scale(1)";
  };

  return (
    <div
      style={{
        ...styles.page,
        backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${safariBg})`,
      }}
    >
      {/* ================= HEADER ================= */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <img src={logo} alt="Big Five Logo" style={styles.logoImg} />
          <h2 style={styles.logo}>BIG FIVE BOOKINGS</h2>
        </div>

        {/* Desktop auth */}
        {!isMobile && (
          <div style={styles.authArea}>
            {!isLoggedIn ? (
              <>
                <Link to="/login" style={styles.headerBtn}>
                  Login
                </Link>
                <Link to="/register" style={styles.headerBtnPrimary}>
                  Register
                </Link>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "white", fontWeight: "bold" }}>
                  Hello, {userName} 👋
                </span>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            style={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <FaTimes size={24} color="white" />
            ) : (
              <FaBars size={24} color="white" />
            )}
          </button>
        )}
      </header>

      {/* ⭐ MOBILE MENU */}
      {isMobile && menuOpen && (
        <div style={styles.mobileMenu}>
          {isLoggedIn && (
            <span style={{ color: "white", fontWeight: "bold", marginBottom: "10px" }}>
              Hello, {userName} 👋
            </span>
          )}
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                style={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={styles.mobileLinkPrimary}
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </>
          ) : (
            <button onClick={handleLogout} style={styles.mobileLogout}>
              Logout
            </button>
          )}
        </div>
      )}

      {/* ================= MAIN ================= */}
      <main style={styles.main}>
        <div
          style={{
            ...styles.welcomeCard,
            transform: loaded ? "translateY(0)" : "translateY(40px)",
            opacity: loaded ? 1 : 0,
          }}
        >
          <p style={styles.welcomeText}>
            🦁 Welcome to Big Five Tours Management System
          </p>

          <h1 style={styles.title}>Tour Operator Dashboard</h1>

          {isLoggedIn && (
            <p style={{ fontWeight: "bold", color: "#1e88e5" }}>
              Welcome back, {userName}!
            </p>
          )}

          <p style={styles.subtitle}>
            Manage clients, hotels, bookings, and payments with elegance and ease.
          </p>

          {isLoggedIn ? (
            <div style={styles.grid}>
              {[
                { to: "/add-client", icon: <FaUserPlus style={styles.icon} />, text: "Add Client", bg: "linear-gradient(135deg,#4facfe,#00f2fe)" },
                { to: "/add-hotel", icon: <FaHotel style={styles.icon} />, text: "Add Hotel", bg: "linear-gradient(135deg,#43e97b,#38f9d7)" },
                { to: "/create-booking", icon: <FaCalendarCheck style={styles.icon} />, text: "Create Booking", bg: "linear-gradient(135deg,#fa709a,#fee140)" },
                { to: "/bookings", icon: <FaChartBar style={styles.icon} />, text: "View Bookings", bg: "linear-gradient(135deg,#667eea,#764ba2)" },
              ].map((card, i) => (
                <Link key={i} to={card.to} style={styles.cardLink}>
                  <div
                    style={{ ...styles.actionCard, background: card.bg }}
                    onMouseEnter={handleHoverEnter}
                    onMouseLeave={handleHoverLeave}
                  >
                    {card.icon}
                    {card.text}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p style={styles.loginNotice}>
              🔒 Please login to access the dashboard
            </p>
          )}
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer style={styles.footer}>
        © 2026 Big Five Tours — Premium Booking System
      </footer>
    </div>
  );
}

export default Home;

// ================= STYLES =================
const styles = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", background: "linear-gradient(135deg, rgba(30,136,229,0.9), rgba(13,71,161,0.9))", color: "white", position: "sticky", top: 0, zIndex: 100 },
  brand: { display: "flex", alignItems: "center", gap: "10px" },
  logoImg: { width: "42px", height: "42px", objectFit: "contain" },
  logo: { margin: 0, fontSize: "clamp(0.9rem, 2vw, 1.2rem)", fontWeight: "bold" },
  authArea: { display: "flex", gap: "10px" },
  hamburger: { background: "transparent", border: "none", cursor: "pointer" },
  mobileMenu: { background: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column", padding: "15px", gap: "12px" },
  mobileLink: { color: "white", textDecoration: "none", padding: "10px", border: "1px solid white", borderRadius: "8px", textAlign: "center" },
  mobileLinkPrimary: { color: "#1e88e5", background: "white", textDecoration: "none", padding: "10px", borderRadius: "8px", textAlign: "center", fontWeight: "bold" },
  mobileLogout: { background: "#e53935", color: "white", border: "none", padding: "10px", borderRadius: "8px" },
  headerBtn: { padding: "8px 16px", background: "rgba(255,255,255,0.2)", border: "1px solid white", color: "white", borderRadius: "8px", textDecoration: "none" },
  headerBtnPrimary: { padding: "8px 16px", background: "white", color: "#1e88e5", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" },
  logoutBtn: { padding: "8px 16px", background: "#e53935", color: "white", border: "none", borderRadius: "8px" },
  main: { flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" },
  welcomeCard: { background: "rgba(255, 255, 255, 0.18)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.25)", padding: "clamp(20px,4vw,40px)", borderRadius: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.25)", width: "100%", maxWidth: "900px", textAlign: "center", transition: "all 0.6s ease" },
  welcomeText: { color: "#1e88e5", fontWeight: "bold", marginBottom: "8px" },
  title: { marginBottom: "10px", color: "#1a1a1a", fontSize: "clamp(1.4rem,3vw,1.9rem)" },
  subtitle: { marginBottom: "25px", color: "#444", fontSize: "clamp(0.9rem,2vw,1rem)" },
  loginNotice: { color: "#e53935", fontWeight: "bold" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "18px", marginTop: "20px" },
  actionCard: { padding: "25px 15px", color: "white", borderRadius: "15px", fontWeight: "bold", cursor: "pointer", transition: "all 0.3s ease", boxShadow: "0 8px 20px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
  icon: { fontSize: "1.8rem", transition: "transform 0.3s ease" },
  cardLink: { textDecoration: "none" },
  footer: { textAlign: "center", padding: "14px", background: "rgba(13,71,161,0.9)", color: "white", fontSize: "0.9rem" },
};