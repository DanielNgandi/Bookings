import { useState, useEffect } from "react";
import API from "../service/api.js";
import { Link } from "react-router-dom";
import { FaHotel, FaMapMarkerAlt, FaEnvelope, FaPhone, FaMoneyBill, FaUniversity } from "react-icons/fa";

function AddHotel() {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    email: "",
    phone: "",
    mpesaNumber: "",
    bankDetails: "",
  });

  const [message, setMessage] = useState("");
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/hotels", formData);
      setMessage("Hotel added successfully ✅");
      setFormData({
        name: "",
        location: "",
        email: "",
        phone: "",
        mpesaNumber: "",
        bankDetails: "",
      });
    } catch (error) {
      console.error(error);
      setMessage("Error adding hotel ❌");
    }
  };

  const fields = [
    { name: "name", placeholder: "Hotel Name", icon: <FaHotel />, required: true },
    { name: "location", placeholder: "Location", icon: <FaMapMarkerAlt />, required: false },
    { name: "email", placeholder: "Email", icon: <FaEnvelope />, required: false },
    { name: "phone", placeholder: "Phone Number", icon: <FaPhone />, required: false },
    { name: "mpesaNumber", placeholder: "Mpesa Number", icon: <FaMoneyBill />, required: false },
    { name: "bankDetails", placeholder: "Bank Details", icon: <FaUniversity />, required: false },
  ];

  return (
    <div style={styles.page}>
      <div
        style={{
          ...styles.card,
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <h2 style={styles.title}>Add New Hotel</h2>
        <p style={styles.subtitle}>Fill in the hotel details below</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {fields.map((field) => (
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
                onFocus={(e) => (e.target.parentNode.style.boxShadow = "0 0 12px rgba(255,255,255,0.6)")}
                onBlur={(e) => (e.target.parentNode.style.boxShadow = "0 0 6px rgba(255,255,255,0.2)")}
              />
            </div>
          ))}

          <button
            type="submit"
            style={styles.button}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Add Hotel
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}

        <Link to="/" style={styles.link}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default AddHotel;

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e88e5, #42a5f5, #90caf9)",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "500px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(15px)",
    borderRadius: "15px",
    padding: "40px 30px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
    textAlign: "center",
    color: "#fff",
    transition: "all 0.5s ease",
  },

  title: {
    fontSize: "1.8rem",
    marginBottom: "5px",
    fontWeight: "bold",
  },

  subtitle: {
    marginBottom: "25px",
    color: "#e0e0e0",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  inputGroup: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.15)",
    borderRadius: "8px",
    padding: "10px 12px",
    transition: "0.3s",
    boxShadow: "0 0 6px rgba(255,255,255,0.2)",
  },

  icon: {
    marginRight: "10px",
    color: "#ffffff",
    fontSize: "1.2rem",
    transition: "0.3s",
  },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#fff",
    fontSize: "1rem",
    padding: "8px 0",
    fontWeight: "500",
  },

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

  message: {
    marginTop: "15px",
    fontWeight: "bold",
    color: "#fff",
  },

  link: {
    display: "block",
    marginTop: "20px",
    textAlign: "center",
    color: "#fff",
    textDecoration: "underline",
  },
};
