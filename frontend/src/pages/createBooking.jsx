import { useState, useEffect } from "react";
import API from "../service/api.js";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaHotel, FaCalendarAlt } from "react-icons/fa";
import safariBg from "../assets/safari-bg.png";

function AddBooking() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    clientId: "",
    hotelId: "",
    checkIn: "",
    checkOut: "",
    adults: "",
    kids: "",
    costAdults: "",
    costKids: "",
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

  const getNumberOfDays = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const diffTime = end - start;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const generateItems = () => {
    const days = getNumberOfDays();
    if (!days) return [];

    const rows = [];

    if (Number(formData.adults) > 0) {
      rows.push({
        date: formData.checkIn,
        service: "Adults Safari",
        pax: Number(formData.adults),
        costPP: Number(formData.costAdults),
        amount: Number(formData.adults) * Number(formData.costAdults) * days,
      });
    }

    if (Number(formData.kids) > 0) {
      rows.push({
        date: formData.checkIn,
        service: "Kids Safari",
        pax: Number(formData.kids),
        costPP: Number(formData.costKids),
        amount: Number(formData.kids) * Number(formData.costKids) * days,
      });
    }

    return rows;
  };

  const calculateTotal = () => {
    const items = generateItems();
    return items.reduce((sum, i) => sum + i.amount, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const items = generateItems();
      if (!items.length) return setMessage("Please select valid dates");

      await API.post("/bookings", {
        clientId: formData.clientId,
        hotelId: formData.hotelId,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        items,
      });

      setMessage("Booking created & invoice generated ✅");
      setTimeout(() => navigate("/bookings"), 1200);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Error creating booking ❌");
    }
  };

  const nights = getNumberOfDays();
  const totalAmount = calculateTotal();

  return (
    <div style={styles.page}>
      <div style={styles.bgAnimation} />
      <div style={styles.overlay} />

      <div
        style={{
          ...styles.card,
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <h2 style={styles.title}>Create New Booking</h2>
        <p style={styles.subtitle}>
          System auto-calculates using nights stayed
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <FaUser />
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
            <FaHotel />
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
            <FaCalendarAlt />
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
            <FaCalendarAlt />
            <input
              type="date"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          {/* 🔹 Number inputs with visible placeholders */}
          <div style={styles.inputGroup}>
            <input
              type="number"
              name="adults"
              value={formData.adults}
              onChange={handleChange}
              placeholder="Adults"
              style={styles.input}
            />
            <input
              type="number"
              name="kids"
              value={formData.kids}
              onChange={handleChange}
              placeholder="Kids"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type="number"
              name="costAdults"
              value={formData.costAdults}
              onChange={handleChange}
              placeholder="Cost per Adult"
              style={styles.input}
            />
            <input
              type="number"
              name="costKids"
              value={formData.costKids}
              onChange={handleChange}
              placeholder="Cost per Kid"
              style={styles.input}
            />
          </div>

          <div style={styles.summary}>
            <p>🛏 Nights: <b>{nights}</b></p>
            <p>💰 Total: <b>US${totalAmount.toLocaleString()}</b></p>
          </div>

          <button type="submit" style={styles.button}>
            Create Booking
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}

        <Link to="/" style={styles.link}>
          ← Back to Home
        </Link>
      </div>

      <style>
        {`
          @keyframes safariMove {
            0% { transform: scale(1.1) translateX(0px); }
            50% { transform: scale(1.15) translateX(-25px); }
            100% { transform: scale(1.1) translateX(0px); }
          }

          /* Placeholder color */
          input::placeholder {
            color: #000; /* black placeholder */
            opacity: 1;
          }
        `}
      </style>
    </div>
  );
}

export default AddBooking;

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
    maxWidth: "700px",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    borderRadius: "15px",
    padding: "40px 30px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.45)",
    textAlign: "center",
    color: "#fff",
    transition: "all 0.5s ease",
  },

  title: { fontSize: "1.8rem", fontWeight: "bold" },
  subtitle: { marginBottom: "25px", color: "#e0e0e0" },

  form: { display: "flex", flexDirection: "column", gap: "15px" },

  inputGroup: { display: "flex", gap: "10px", flexWrap: "wrap" },

  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "rgba(255,255,255,0.18)",
    borderRadius: "8px",
    padding: "8px 10px",
    color: "#fff",
  },

  summary: {
    background: "rgba(0,0,0,0.35)",
    padding: "12px",
    borderRadius: "8px",
    fontWeight: "bold",
  },

  button: {
    padding: "10px 15px",
    background: "linear-gradient(90deg, #1e88e5, #42a5f5)",
    color: "#fff",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  message: { marginTop: "15px", fontWeight: "bold" },

  link: {
    display: "block",
    marginTop: "20px",
    color: "#fff",
    textDecoration: "underline",
  },
};