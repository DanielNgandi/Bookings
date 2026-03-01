import { useState, useEffect } from "react";
import API from "../service/api.js";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaHotel, FaCalendarAlt } from "react-icons/fa";
import safariBg from "../assets/safari-bg.png";
import Swal from "sweetalert2";

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
      Swal.fire({
        icon: "error",
        title: "Failed to load clients",
        text: "Please refresh the page.",
      });
    }
  };

  const fetchHotels = async () => {
    try {
      const res = await API.get("/hotels");
      setHotels(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed to load hotels",
        text: "Please refresh the page.",
      });
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
        amount:
          Number(formData.adults) *
          Number(formData.costAdults) *
          days,
      });
    }

    if (Number(formData.kids) > 0) {
      rows.push({
        date: formData.checkIn,
        service: "Kids Safari",
        pax: Number(formData.kids),
        costPP: Number(formData.costKids),
        amount:
          Number(formData.kids) *
          Number(formData.costKids) *
          days,
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

    const items = generateItems();
    const nights = getNumberOfDays();

    // ✅ FRONTEND VALIDATION
    if (!formData.clientId || !formData.hotelId) {
      return Swal.fire({
        icon: "warning",
        title: "Missing selection",
        text: "Please select client and hotel.",
      });
    }

    if (!nights) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid dates",
        text: "Check-out must be after check-in.",
      });
    }

    if (!items.length) {
      return Swal.fire({
        icon: "warning",
        title: "No passengers",
        text: "Enter adults or kids greater than zero.",
      });
    }

    try {
      await API.post("/bookings", {
        clientId: formData.clientId,
        hotelId: formData.hotelId,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        items,
      });

      // ✅ SUCCESS ALERT
      await Swal.fire({
        icon: "success",
        title: "Booking created",
        text: "Invoice generated successfully",
        confirmButtonColor: "#16a34a",
      });

      setTimeout(() => navigate("/bookings"), 800);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Booking failed",
        text:
          error.response?.data?.message ||
          "Error creating booking",
        confirmButtonColor: "#dc2626",
      });
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
              className="glass-select"
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
              className="glass-select"
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

        <Link to="/" style={styles.link}>
          ← Back to Home
        </Link>
      </div>

      {/* 🔥 your existing CSS untouched */}
      <style>{`
        @keyframes safariMove {
          0% { transform: scale(1.1) translateX(0px); }
          50% { transform: scale(1.15) translateX(-25px); }
          100% { transform: scale(1.1) translateX(0px); }
        }

        input::placeholder {
          color: #000;
          opacity: 1;
        }

        .glass-select {
          cursor: pointer;
          color: #c9bdbd;
          background-color: rgba(255,255,255,0.18);
          background-image: url("data:image/svg+xml;utf8,<svg fill='white' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 18px;
          padding-right: 40px;
        }

        .glass-select option {
          color: #000 !important;
          background-color: #c9bdbd !important;
        }

        input:focus,
        .glass-select:focus {
          outline: none;
          border: 1px solid #42a5f5;
          box-shadow: 0 0 0 2px rgba(66,165,245,0.35);
        }
      `}</style>
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

  inputGroup: { display: "flex", gap: "10px", flexWrap: "wrap", },

  input: {
  flex: 1,
  border: "1px solid rgba(255,255,255,0.25)",
  outline: "none",
  background: "rgba(255,255,255,0.18)",
  borderRadius: "10px",
  padding: "12px 14px",
  color: "#fff",
  fontSize: "14px",
  transition: "all 0.25s ease",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
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