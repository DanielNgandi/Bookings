import { useState, useEffect } from "react";
import API from "../service/api.js";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaBuilding, FaGlobe, FaEnvelope, FaPhone } from "react-icons/fa";
import safariBg from "../assets/safari-bg.png";

function AddClient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    country: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/clients", formData);
      setMessage("Client added successfully ✅");
      setFormData({ name: "", company: "", country: "", email: "", phone: "" });

      setTimeout(() => navigate("/add-hotel"), 1000);
    } catch (error) {
      console.error(error);
      setMessage("Error adding client ❌");
    }
  };

  return (
    <div style={styles.page}>
      {/* 🎬 Animated moving background */}
      <div style={styles.bgAnimation} />

      {/* 🌑 Dark cinematic overlay */}
      <div style={styles.overlay} />

      <div
        style={{
          ...styles.card,
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <h2 style={styles.title}>Add New Client</h2>
        <p style={styles.subtitle}>Fill in the client details below</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {[
            { name: "name", placeholder: "Full Name", icon: <FaUser />, required: true },
            { name: "company", placeholder: "Company", icon: <FaBuilding />, required: false },
            { name: "country", placeholder: "Country", icon: <FaGlobe />, required: false },
            { name: "email", placeholder: "Email", icon: <FaEnvelope />, required: false },
            { name: "phone", placeholder: "Phone Number", icon: <FaPhone />, required: false },
          ].map((field) => (
            <div style={styles.inputGroup} key={field.name}>
              <span style={styles.icon}>{field.icon}</span>
              <input
                type={field.name === "email" ? "email" : "text"}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={handleChange}
                style={styles.input}
                required={field.required}
                onFocus={(e) =>
                  (e.target.parentNode.style.boxShadow = "0 0 12px rgba(255,255,255,0.6)")
                }
                onBlur={(e) =>
                  (e.target.parentNode.style.boxShadow = "0 0 6px rgba(255,255,255,0.2)")
                }
              />
            </div>
          ))}

          <button
            type="submit"
            style={styles.button}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Add Client
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}

        {/* ✅ Back to Home link */}
        <Link to="/" style={styles.backLink}>
          ← Back to Home
        </Link>
      </div>

      {/* 🔥 Keyframes for animation */}
      <style>
        {`
          @keyframes safariMove {
            0% { transform: scale(1.1) translateX(0px); }
            50% { transform: scale(1.15) translateX(-25px); }
            100% { transform: scale(1.1) translateX(0px); }
          }
        `}
      </style>
    </div>
  );
}

export default AddClient;

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    overflow: "hidden",
  },

  // 🎬 MOVING BACKGROUND
  bgAnimation: {
    position: "absolute",
    inset: 0,
    backgroundImage: `url(${safariBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    animation: "safariMove 25s ease-in-out infinite",
    zIndex: 0,
  },

  // 🌑 CINEMATIC DARK OVERLAY
  overlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.65))",
    zIndex: 1,
  },

  card: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: "500px",
    background: "rgba(255, 255, 255, 0.12)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    borderRadius: "15px",
    padding: "40px 30px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.45)",
    textAlign: "center",
    color: "#fff",
    transition: "all 0.5s ease",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  title: { fontSize: "1.8rem", marginBottom: "5px", fontWeight: "bold" },
  subtitle: { marginBottom: "25px", color: "#e0e0e0" },

  form: { display: "flex", flexDirection: "column", gap: "15px" },

  inputGroup: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.18)",
    borderRadius: "8px",
    padding: "10px 12px",
    transition: "0.3s",
    boxShadow: "0 0 6px rgba(255,255,255,0.2)",
  },

  icon: { marginRight: "10px", color: "#ffffff", fontSize: "1.2rem", transition: "0.3s" },
  input: { flex: 1, border: "none", outline: "none", background: "transparent", color: "#fff", fontSize: "1rem", padding: "8px 0", fontWeight: "500" },

  button: {
    marginTop: "10px",
    padding: "12px",
    background: "linear-gradient(90deg, #1e88e5, #42a5f5)",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  message: { marginTop: "15px", fontWeight: "bold", color: "#fff" },

  backLink: {
    marginTop: "20px",
    color: "#1e88e5",
    fontWeight: "bold",
    textDecoration: "none",
    transition: "0.3s",
    alignSelf: "center",
  },
  backLinkHover: {
    textDecoration: "underline",
  },
};