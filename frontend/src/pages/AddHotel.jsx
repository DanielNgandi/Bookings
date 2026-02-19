import { useState } from "react";
import API from "../service/api.js";
import { Link } from "react-router-dom";

function AddHotel() {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    rooms: "",
    pricePerNight: "",
    contact: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/hotels", formData);
      setMessage("Hotel added successfully ✅");
      setFormData({
        name: "",
        location: "",
        rooms: "",
        pricePerNight: "",
        contact: "",
      });
    } catch (error) {
      setMessage("Error adding hotel ❌");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Add New Hotel</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="name"
            placeholder="Hotel Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="rooms"
            placeholder="Number of Rooms"
            value={formData.rooms}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="pricePerNight"
            placeholder="Price per Night"
            value={formData.pricePerNight}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="contact"
            placeholder="Contact Info"
            value={formData.contact}
            onChange={handleChange}
          />

          <button type="submit" style={styles.button}>
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
    backgroundColor: "#fff",
    padding: "40px 30px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "450px",
    boxSizing: "border-box",
  },
  title: {
    marginBottom: "20px",
    color: "#1a1a1a",
    fontSize: "1.5rem",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#1e88e5",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "1rem",
    cursor: "pointer",
  },
  message: {
    marginTop: "15px",
    textAlign: "center",
    color: "green",
    fontWeight: "bold",
  },
  link: {
    display: "block",
    marginTop: "20px",
    textAlign: "center",
    color: "#1e88e5",
    textDecoration: "none",
  },
};

export default AddHotel;
