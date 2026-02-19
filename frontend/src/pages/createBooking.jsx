import { useState, useEffect, useRef } from "react";
import API from "../service/api.js";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../assets/logo.png"; // Logo path

function CreateBooking() {
  const [clients, setClients] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [formData, setFormData] = useState({
    clientId: "",
    hotelId: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  });
  const [message, setMessage] = useState("");

  const voucherRef = useRef();
  const invoiceRef = useRef();

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);

  // Fetch clients and hotels
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientsRes = await API.get("/clients");
        setClients(clientsRes.data);

        const hotelsRes = await API.get("/hotels");
        setHotels(hotelsRes.data);
      } catch (error) {
        console.log("Error fetching clients or hotels", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Set selected client/hotel for PDF
    if (name === "clientId") {
      const client = clients.find(c => c.id === value);
      setSelectedClient(client);
    }
    if (name === "hotelId") {
      const hotel = hotels.find(h => h.id === value);
      setSelectedHotel(hotel);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.clientId || !formData.hotelId || !formData.checkIn || !formData.checkOut) {
      setMessage("Please fill in all required fields ❌");
      return;
    }

    try {
      await API.post("/bookings", formData);
      setMessage("Booking created successfully ✅");
      setFormData({
        clientId: "",
        hotelId: "",
        checkIn: "",
        checkOut: "",
        guests: 0,
      });
      setSelectedClient(null);
      setSelectedHotel(null);
    } catch (error) {
      setMessage("Error creating booking ❌");
    }
  };

  // PDF Generation
  const generatePDF = async (ref, filename) => {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create New Booking</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <select name="clientId" value={formData.clientId} onChange={handleChange} required>
            <option value="">Select Client</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({c.phone || c.email})
              </option>
            ))}
          </select>

          <select name="hotelId" value={formData.hotelId} onChange={handleChange} required>
            <option value="">Select Hotel</option>
            {hotels.map(h => (
              <option key={h.id} value={h.id}>
                {h.name} - {h.location}
              </option>
            ))}
          </select>

          <input type="date" name="checkIn" value={formData.checkIn} onChange={handleChange} required />
          <input type="date" name="checkOut" value={formData.checkOut} onChange={handleChange} required />
          <input type="number" name="guests" value={formData.guests} onChange={handleChange} min="1" required />

          <button type="submit" style={styles.button}>Create Booking</button>
        </form>

        {message && <p style={styles.message}>{message}</p>}

        <div style={styles.pdfButtons}>
          <button onClick={() => generatePDF(voucherRef, "BigFive_Voucher.pdf")} style={styles.pdfButton}>
            Generate Voucher PDF
          </button>
          <button onClick={() => generatePDF(invoiceRef, "BigFive_Invoice.pdf")} style={styles.pdfButton}>
            Generate Invoice PDF
          </button>
        </div>

        <Link to="/" style={styles.link}>← Home</Link>

        {/* Hidden PDF Templates */}
        <div style={{ display: "none" }}>
          {/* Voucher */}
          <div ref={voucherRef} style={styles.pdfCard}>
            <img src={logo} alt="Big Five Logo" style={styles.logo} />
            <h1 style={{ color: "#1e88e5", textAlign: "center" }}>BIG FIVE VOUCHER 2025</h1>
            <hr />
            <table style={styles.table}>
              <tbody>
                <tr><td>Client:</td><td>{selectedClient?.fullName}</td></tr>
                <tr><td>Hotel:</td><td>{selectedHotel?.name}</td></tr>
                <tr><td>Location:</td><td>{selectedHotel?.location}</td></tr>
                <tr><td>Check-In:</td><td>{formData.checkIn}</td></tr>
                <tr><td>Check-Out:</td><td>{formData.checkOut}</td></tr>
                <tr><td>Guests:</td><td>{formData.guests}</td></tr>
              </tbody>
            </table>
            <p style={{ marginTop: "20px", textAlign: "center" }}>Thank you for booking with Big Five!</p>
          </div>

          {/* Invoice */}
          <div ref={invoiceRef} style={styles.pdfCard}>
            <img src={logo} alt="Big Five Logo" style={styles.logo} />
            <h1 style={{ color: "#43a047", textAlign: "center" }}>BIG FIVE INVOICE</h1>
            <hr />
            <table style={styles.table}>
              <tbody>
                <tr><td>Client:</td><td>{selectedClient?.fullName}</td></tr>
                <tr><td>Hotel:</td><td>{selectedHotel?.name}</td></tr>
                <tr><td>Check-In:</td><td>{formData.checkIn}</td></tr>
                <tr><td>Check-Out:</td><td>{formData.checkOut}</td></tr>
                <tr><td>Guests:</td><td>{formData.guests}</td></tr>
                <tr><td>Price per Night:</td><td>{selectedHotel?.pricePerNight}</td></tr>
                <tr><td>Total:</td><td>{selectedHotel?.pricePerNight * formData.guests}</td></tr>
              </tbody>
            </table>
            <p style={{ marginTop: "20px", textAlign: "center" }}>Thank you for booking with Big Five!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f4f6f9", padding: "20px" },
  card: { backgroundColor: "#fff", padding: "40px 30px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", width: "100%", maxWidth: "500px", boxSizing: "border-box" },
  title: { marginBottom: "20px", color: "#1a1a1a", fontSize: "1.5rem", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  button: { padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#1e88e5", color: "#fff", fontWeight: "bold", fontSize: "1rem", cursor: "pointer" },
  pdfButtons: { display: "flex", justifyContent: "space-between", marginTop: "15px" },
  pdfButton: { padding: "10px 12px", borderRadius: "8px", border: "none", backgroundColor: "#43a047", color: "#fff", fontWeight: "bold", cursor: "pointer" },
  message: { marginTop: "15px", textAlign: "center", color: "green", fontWeight: "bold" },
  link: { display: "block", marginTop: "20px", textAlign: "center", color: "#1e88e5", textDecoration: "none" },

  // PDF Styles
  pdfCard: { width: "800px", padding: "30px", fontFamily: "Arial", backgroundColor: "#fff", border: "1px solid #ccc" },
  logo: { width: "150px", display: "block", margin: "0 auto 20px auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableCell: { border: "1px solid #ccc", padding: "8px" },
};

export default CreateBooking;
