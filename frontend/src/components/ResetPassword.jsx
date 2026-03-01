import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../service/api.js";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // Pre-fill token if passed via navigation state
  useEffect(() => {
    if (location.state?.token) {
      setToken(location.state.token);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match ❌");
      return;
    }

    try {
      const res = await API.post("/auth/reset-password", {
        token,
        password,
      });
      setMessage(res.data.message);

      // Redirect to login after 1.5s
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch {
      setMessage("Reset failed ❌");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('/safari-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Segoe UI, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255, 255, 255, 0.95)",
          padding: "40px",
          borderRadius: "14px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "10px", color: "#2c3e50" }}>Reset Password</h2>
        <p style={{ color: "#666", marginBottom: "25px" }}>
          Enter your reset token and new password
        </p>

        <form style={{ display: "flex", flexDirection: "column", gap: "15px" }} onSubmit={handleSubmit}>
          <input
            placeholder="Reset token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            Reset Password
          </button>
        </form>

        {message && (
          <p style={{ marginTop: "20px", color: message.includes("❌") ? "red" : "green", fontWeight: "500" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

const inputStyle = { padding: "12px 14px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "15px", outline: "none" };
const buttonStyle = { padding: "12px", borderRadius: "8px", border: "none", background: "#27ae60", color: "white", fontSize: "16px", fontWeight: "600", cursor: "pointer", transition: "0.3s ease" };

export default ResetPassword;