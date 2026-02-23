import { useState, useEffect } from "react";
import axios from "axios";
import AddPayment from "./AddPayment"; // We'll use a modal/component for payment form

function UnpaidBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null); // Booking to pay

  const token = localStorage.getItem("token"); // JWT token

  // Fetch unpaid bookings
  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter only unpaid bookings
      const unpaid = res.data.filter(b => b.status === "PENDING");
      setBookings(unpaid);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Callback after successful payment
  const handlePaymentSuccess = () => {
    alert("Payment completed successfully!");
    setSelectedBooking(null); // close form
    fetchBookings(); // refresh unpaid bookings
  };

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p className="error">{error}</p>;
  if (bookings.length === 0) return <p>No unpaid bookings available.</p>;

  return (
    <div>
      <h2>Unpaid Bookings</h2>
      <table className="booking-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Hotel</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.client.name}</td>
              <td>{b.hotel.name}</td>
              <td>{new Date(b.checkIn).toLocaleDateString()}</td>
              <td>{new Date(b.checkOut).toLocaleDateString()}</td>
              <td>{b.totalAmount.toFixed(2)}</td>
              <td>{b.status}</td>
              <td>
                {/* Disable button if already paid */}
                <button
                  onClick={() => setSelectedBooking(b)}
                  disabled={b.status !== "PENDING"}
                >
                  Pay
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Payment Form Modal */}
      {selectedBooking && (
        <div className="modal">
          <h3>Pay for Booking #{selectedBooking.id}</h3>
          <AddPayment
            bookingId={selectedBooking.id}
            onPaymentSuccess={handlePaymentSuccess}
          />
          <button onClick={() => setSelectedBooking(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default UnpaidBookings;