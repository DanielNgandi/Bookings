import { useState, useEffect} from "react";
import API from "../service/api.js";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaHotel, FaCalendarAlt, FaDollarSign } from "react-icons/fa";

function AddBooking() {
    const navigate = useNavigate(); 
  const [formData, setFormData] = useState({
    clientId: "",
    hotelId: "",
    checkIn: "",
    checkOut: "",
    rooms: "",
    totalAmount: "",
  });

  const [clients, setClients] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [message, setMessage] = useState("");
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    fetchClients();
    fetchHotels();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await API.get("/clients");
          console.log("CLIENTS RESPONSE:", res.data); // 👈 ADD THIS

      setClients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHotels = async () => {
    try {
      const res = await API.get("/hotels");
      setHotels(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/bookings", formData);
      setMessage("Booking created & invoice generated ✅");
      setFormData({
        clientId: "",
        hotelId: "",
        checkIn: "",
        checkOut: "",
        rooms: "",
        totalAmount: "",
      });
      setTimeout(() => navigate("/bookings"), 1000); 
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Error creating booking ❌");
    }
  };

  return (
    <div style={styles.page}>
      <div
        style={{
          ...styles.card,
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <h2 style={styles.title}>Create New Booking</h2>
        <p style={styles.subtitle}>Select client, hotel, and booking details</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <FaUser style={styles.icon} />
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <FaHotel style={styles.icon} />
            <select
              name="hotelId"
              value={formData.hotelId}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="">Select Hotel</option>
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.inputGroup}>
            <FaCalendarAlt style={styles.icon} />
            <input
              type="date"
              name="checkIn"
              value={formData.checkIn}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <FaCalendarAlt style={styles.icon} />
            <input
              type="date"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <FaHotel style={styles.icon} />
            <input
              type="text"
              name="rooms"
              placeholder="Number of Rooms (e.g. 2)"
              value={formData.rooms}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <FaDollarSign style={styles.icon} />
            <input
              type="number"
              name="totalAmount"
              placeholder="Total Amount"
              value={formData.totalAmount}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            style={styles.button}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Create Booking
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

export default AddBooking;

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
    maxWidth: "550px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(15px)",
    borderRadius: "15px",
    padding: "40px 30px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
    textAlign: "center",
    color: "#fff",
    transition: "all 0.5s ease",
  },
  title: { fontSize: "1.8rem", marginBottom: "5px", fontWeight: "bold" },
  subtitle: { marginBottom: "25px", color: "#e0e0e0" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.15)",
    borderRadius: "8px",
    padding: "10px 12px",
    transition: "0.3s",
    boxShadow: "0 0 6px rgba(255,255,255,0.2)",
  },
  icon: { marginRight: "10px", fontSize: "1.2rem" },
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
  message: { marginTop: "15px", fontWeight: "bold", color: "#fff" },
  link: { display: "block", marginTop: "20px", textAlign: "center", color: "#fff", textDecoration: "underline" },
};
