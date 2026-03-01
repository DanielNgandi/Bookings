import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../service/api.js";
import bgImage from "../assets/safari-bg.png"; 

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.email || !formData.password) {
      setMessage("Email and password are required ❌");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/login", formData);

      const userData = {
        ...res.data.user,
        token: res.data.token,
      };

      localStorage.setItem("user", JSON.stringify(userData));

      setMessage("Login successful ✅ Redirecting...");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* 🌑 overlay */}
      <div style={styles.overlay}></div>

      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && <p style={styles.message}>{message}</p>}

        <p style={styles.linkText}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <p style={{ textAlign: "right" }}>
  <Link to="/forgot-password" style={{ color: "#fff" }}>
    Forgot password?
  </Link>
</p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "relative",
    padding: "20px",
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.45)",
    top: 0,
    left: 0,
  },

  card: {
    position: "relative",
    width: "100%",
    maxWidth: "400px",
    padding: "35px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    color: "#fff",
    zIndex: 2,
  },

  title: {
    textAlign: "center",
    fontSize: "1.8rem",
    fontWeight: "bold",
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    fontSize: "1rem",
    outline: "none",
  },

  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#43a047",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },

  message: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },

  linkText: {
    textAlign: "center",
    fontSize: "0.9rem",
  },
};

export default Login;