import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../service/api.js";
import bgImage from "../assets/safari-bg.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);
      const res = await API.post("/auth/forgot-password", { email });

      setMessage(res.data.message);

      // ✅ If token is returned, redirect to ResetPassword and pass token
      if (res.data.resetToken) {
        setTimeout(() => {
          navigate("/reset-password", { state: { token: res.data.resetToken } });
        }, 1500); // wait 1.5s to show message
      }
    } catch {
      setMessage("Error requesting reset ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>

      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Forgot Password</h2>
        <p style={styles.subtitle}>
          Enter your email to receive a reset token
        </p>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Processing..." : "Request Reset"}
        </button>

        {message && <p style={styles.message}>{message}</p>}
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
    maxWidth: "420px",
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
    textAlign: "center",
  },
  title: { fontSize: "1.8rem", fontWeight: "bold" },
  subtitle: { fontSize: "0.9rem", opacity: 0.9, marginBottom: "10px" },
  input: { padding: "12px", borderRadius: "8px", border: "none", fontSize: "1rem", outline: "none" },
  button: { padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#fb8c00", color: "#fff", fontSize: "1rem", fontWeight: "bold", cursor: "pointer" },
  message: { marginTop: "10px", fontWeight: "bold" },
};

export default ForgotPassword;