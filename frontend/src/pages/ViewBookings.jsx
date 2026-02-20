import { useEffect, useState, useMemo } from "react";
import API from "../service/api.js";
import { FaCalendarAlt, FaUser, FaHotel, FaMoneyBill } from "react-icons/fa";
import { Link } from "react-router-dom";

function ViewBookings() {
  const [bookings, setBookings] = useState([]);
  const [fadeIn, setFadeIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ===== FORMAT CURRENCY (matches your invoice style) =====
  const formatMoney = (amount) =>
    `US$${Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Responsive check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setFadeIn(true);
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get("/bookings");
      setBookings(res.data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Download helper
  const downloadFile = async (url, filename) => {
    try {
      const res = await API.get(url, { responseType: "blob" });
      const href = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = href;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download file. Please try again.");
    }
  };

  // ===== FILTERED BOOKINGS (memoized for performance) =====
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const clientName = b.client?.name?.toLowerCase() || "";
      const hotelName = b.hotel?.name?.toLowerCase() || "";
      const searchLower = search.toLowerCase();

      const matchesSearch =
        clientName.includes(searchLower) ||
        hotelName.includes(searchLower);

      const matchesStatus =
        filterStatus === ""
          ? true
          : filterStatus === "paid"
          ? !!b.payment
          : !b.payment;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, filterStatus]);

  // ===== TOTALS =====
  const totalRevenue = useMemo(
    () => bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0),
    [bookings]
  );

  const pendingAmount = useMemo(
    () =>
      bookings
        .filter((b) => !b.payment)
        .reduce((acc, b) => acc + (b.totalAmount || 0), 0),
    [bookings]
  );

  return (
    <div style={styles.page}>
      <div
        style={{
          ...styles.card,
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <h2 style={styles.title}>All Bookings</h2>
        <p style={styles.subtitle}>
          Manage and monitor your tour reservations
        </p>

        {/* SEARCH & FILTER */}
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="Search by client or hotel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.searchInput}
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* SUMMARY BAR */}
        <div style={styles.summaryBar}>
          <div>Bookings: {bookings.length}</div>
          <div>Revenue: {formatMoney(totalRevenue)}</div>
          <div>Pending: {formatMoney(pendingAmount)}</div>
        </div>

        {loading ? (
          <p style={styles.message}>Loading bookings...</p>
        ) : filteredBookings.length === 0 ? (
          <p style={styles.message}>No bookings found</p>
        ) : isMobile ? (
          // ===== MOBILE =====
          <div style={styles.mobileList}>
            {filteredBookings.map((booking) => (
              <div key={booking.id} style={styles.mobileCard}>
                <div style={styles.mobileRow}>
                  <FaUser /> <strong>{booking.client?.name || "—"}</strong>
                </div>
                <div style={styles.mobileRow}>
                  <FaHotel /> {booking.hotel?.name || "—"}
                </div>
                <div style={styles.mobileRow}>
                  <FaCalendarAlt /> {booking.checkIn?.slice(0, 10)} →{" "}
                  {booking.checkOut?.slice(0, 10)}
                </div>
                <div style={styles.mobileRow}>
                  Rooms: {booking.rooms}
                </div>
                <div style={styles.mobileRow}>
                  <FaMoneyBill /> {formatMoney(booking.totalAmount)}
                </div>

                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: booking.payment
                      ? "#2e7d32"
                      : "#ef6c00",
                  }}
                >
                  {booking.payment ? "Paid" : "Pending"}
                </span>

                <div style={styles.mobileActions}>
                  <button
                    style={styles.invoiceBtn}
                    onClick={() =>
                      downloadFile(
                        `/bookings/invoice/${booking.id}`,
                        `invoice-${booking.id}.pdf`
                      )
                    }
                  >
                    Invoice
                  </button>
                  <button
                    style={styles.voucherBtn}
                    onClick={() =>
                      downloadFile(
                        `/bookings/voucher/${booking.id}`,
                        `voucher-${booking.id}.pdf`
                      )
                    }
                  >
                    Voucher
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // ===== DESKTOP =====
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Hotel</th>
                  <th>Dates</th>
                  <th>Rooms</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} style={styles.row}>
                    <td>
                      <FaUser /> {booking.client?.name || "—"}
                    </td>
                    <td>
                      <FaHotel /> {booking.hotel?.name || "—"}
                    </td>
                    <td>
                      <FaCalendarAlt /> {booking.checkIn?.slice(0, 10)} →{" "}
                      {booking.checkOut?.slice(0, 10)}
                    </td>
                    <td>{booking.rooms}</td>
                    <td>{formatMoney(booking.totalAmount)}</td>
                    <td>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: booking.payment
                            ? "#2e7d32"
                            : "#ef6c00",
                        }}
                      >
                        {booking.payment ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td style={styles.actionsCell}>
                      <button
                        style={styles.invoiceBtn}
                        onClick={() =>
                          downloadFile(
                            `/bookings/invoice/${booking.id}`,
                            `invoice-${booking.id}.pdf`
                          )
                        }
                      >
                        Invoice
                      </button>
                      <button
                        style={styles.voucherBtn}
                        onClick={() =>
                          downloadFile(
                            `/bookings/voucher/${booking.id}`,
                            `voucher-${booking.id}.pdf`
                          )
                        }
                      >
                        Voucher
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Link to="/" style={styles.link}>
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default ViewBookings;

// ===== STYLES =====
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
    maxWidth: "1100px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(15px)",
    borderRadius: "16px",
    padding: "40px 30px",
    boxShadow: "0 10px 35px rgba(0,0,0,0.25)",
    textAlign: "center",
    color: "#fff",
    transition: "all 0.5s ease",
  },
  title: { fontSize: "2rem", fontWeight: "bold" },
  subtitle: { marginBottom: "20px", color: "#e0e0e0" },

  searchBar: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "15px",
    flexWrap: "wrap",
  },
  searchInput: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    fontSize: "0.9rem",
  },

  summaryBar: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "20px",
    fontWeight: "bold",
    flexWrap: "wrap",
    gap: "10px",
  },

  tableWrapper: { overflowX: "auto", marginTop: "20px" },
  table: { width: "100%", borderCollapse: "collapse", color: "#fff" },

  row: {
    borderBottom: "1px solid rgba(255,255,255,0.2)",
    transition: "all 0.25s ease",
  },

  statusBadge: {
    padding: "5px 12px",
    borderRadius: "999px",
    fontWeight: "bold",
    color: "#fff",
    fontSize: "0.8rem",
  },

  actionsCell: { display: "flex", gap: "10px" },

  invoiceBtn: {
    padding: "7px 12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2e7d32",
    color: "#fff",
    cursor: "pointer",
    fontSize: "0.85rem",
    transition: "0.2s",
  },
  voucherBtn: {
    padding: "7px 12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#1565c0",
    color: "#fff",
    cursor: "pointer",
    fontSize: "0.85rem",
    transition: "0.2s",
  },

  mobileList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginTop: "20px",
  },
  mobileCard: {
    background: "rgba(255,255,255,0.15)",
    borderRadius: "14px",
    padding: "16px",
    textAlign: "left",
    backdropFilter: "blur(10px)",
    transition: "transform 0.25s ease",
  },
  mobileRow: {
    marginBottom: "6px",
    fontSize: "0.95rem",
  },
  mobileActions: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
  },

  message: { marginTop: "20px", fontWeight: "bold" },
  link: {
    display: "block",
    marginTop: "25px",
    color: "#fff",
    textDecoration: "underline",
  },
};