import { useEffect, useState, useMemo } from "react";
import API from "../service/api.js";
import { FaCalendarAlt, FaUser, FaHotel, FaMoneyBill } from "react-icons/fa";
import { Link } from "react-router-dom";
import AddPayment from "./AddPayment";
import safariBg from "../assets/safari-bg.png";

function ViewBookings() {
  const [bookings, setBookings] = useState([]);
  const [fadeIn, setFadeIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const formatMoney = (amount) =>
    `US$${Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // ✅ calculate paid amount safely
  const getPaidAmount = (booking) => {
    if (!booking.payments) return 0;
    return booking.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  };

  const getRemainingBalance = (booking) => {
    return Math.max((booking.totalAmount || 0) - getPaidAmount(booking), 0);
  };

  const getPaymentStatus = (booking) => {
    return getRemainingBalance(booking) === 0 ? "paid" : "pending";
  };

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
    setLoading(true);
    try {
      const res = await API.get("/bookings");
      setBookings(res.data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

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

  // ✅ FILTERING
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const clientName = b.client?.name?.toLowerCase() || "";
      const hotelName = b.hotel?.name?.toLowerCase() || "";
      const searchLower = search.toLowerCase();

      const matchesSearch =
        clientName.includes(searchLower) ||
        hotelName.includes(searchLower);

      const status = getPaymentStatus(b);

      const matchesStatus =
        filterStatus === ""
          ? true
          : filterStatus === "paid"
          ? status === "paid"
          : filterStatus === "pending"
          ? status === "pending"
          : true;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, filterStatus]);

  // ✅ TOTAL REVENUE (paid only)
  const totalRevenue = useMemo(() => {
    return bookings.reduce((acc, b) => acc + getPaidAmount(b), 0);
  }, [bookings]);

  // ✅ TOTAL PENDING
  const pendingAmount = useMemo(() => {
    return bookings.reduce((acc, b) => acc + getRemainingBalance(b), 0);
  }, [bookings]);

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
        <h2 style={styles.title}>All Bookings</h2>
        <p style={styles.subtitle}>
          Manage and monitor your tour reservations
        </p>

        {/* SEARCH */}
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

        {/* SUMMARY */}
        <div style={styles.summaryBar}>
          <div>Bookings: {bookings.length}</div>
          <div>Collected: {formatMoney(totalRevenue)}</div>
          <div>Pending: {formatMoney(pendingAmount)}</div>
        </div>

        {/* LOADING */}
        {loading ? (
          <p style={styles.message}>Loading bookings...</p>
        ) : filteredBookings.length === 0 ? (
          <p style={styles.message}>No bookings found</p>
        ) : isMobile ? (
          <div style={styles.mobileList}>
            {filteredBookings.map((booking) => {
              const paid = getPaidAmount(booking);
              const remaining = getRemainingBalance(booking);
              const status = getPaymentStatus(booking);

              return (
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
                  <div style={styles.mobileRow}>Rooms: {booking.rooms}</div>
                  <div style={styles.mobileRow}>
                    <FaMoneyBill /> {formatMoney(booking.totalAmount)}
                  </div>
                  <div style={styles.mobileRow}>
                    Paid: {formatMoney(paid)} | Remaining:{" "}
                    {formatMoney(remaining)}
                  </div>

                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor:
                        status === "paid" ? "#2e7d32" : "#ef6c00",
                    }}
                  >
                    {status === "paid" ? "Paid" : "Pending"}
                  </span>

                  <div style={styles.mobileActions}>
                    {remaining > 0 && (
                      <button
                        style={styles.invoiceBtn}
                        onClick={() => setSelectedBooking(booking)}
                      >
                        Pay
                      </button>
                    )}

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

                    {paid > 0 && (
                      <button
                        style={styles.voucherBtn}
                        onClick={() =>
                          downloadFile(
                            `/bookings/${booking.id}/receipt`,
                            `receipt-${booking.id}.pdf`
                          )
                        }
                      >
                        Receipt
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Hotel</th>
                  <th>Dates</th>
                  <th>Rooms</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const paid = getPaidAmount(booking);
                  const remaining = getRemainingBalance(booking);
                  const status = getPaymentStatus(booking);

                  return (
                    <tr key={booking.id} style={styles.row}>
                      <td>
                        <FaUser /> {booking.client?.name || "—"}
                      </td>
                      <td>
                        <FaHotel /> {booking.hotel?.name || "—"}
                      </td>
                      <td>
                        <FaCalendarAlt />{" "}
                        {booking.checkIn?.slice(0, 10)} →{" "}
                        {booking.checkOut?.slice(0, 10)}
                      </td>
                      <td>{booking.rooms}</td>
                      <td>{formatMoney(booking.totalAmount)}</td>
                      <td>{formatMoney(paid)}</td>
                      <td>{formatMoney(remaining)}</td>
                      <td>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor:
                              status === "paid" ? "#2e7d32" : "#ef6c00",
                          }}
                        >
                          {status === "paid" ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td style={styles.actionsCell}>
                        {remaining > 0 && (
                          <button
                            style={styles.invoiceBtn}
                            onClick={() => setSelectedBooking(booking)}
                          >
                            Pay
                          </button>
                        )}

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

                        {paid > 0 && (
                          <button
                            style={styles.voucherBtn}
                            onClick={() =>
                              downloadFile(
                                `/bookings/${booking.id}/receipt`,
                                `receipt-${booking.id}.pdf`
                              )
                            }
                          >
                            Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ✅ PAYMENT MODAL */}
        {selectedBooking && (
          <div style={styles.modalBackdrop}>
            <div style={styles.modalContent}>
              <h3>Pay for Booking #{selectedBooking.id}</h3>

              <AddPayment
                bookingId={selectedBooking.id}
                totalAmount={selectedBooking.totalAmount}
                paidAmount={getPaidAmount(selectedBooking)}
                onPaymentSuccess={() => {
                  setSelectedBooking(null);
                  fetchBookings();
                }}
              />

              <button
                style={styles.cancelBtn}
                onClick={() => setSelectedBooking(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <Link to="/" style={styles.link}>
          ← Back to Dashboard
        </Link>
      </div>

      <style>
        {`
          @keyframes safariMove {
            0% { transform: scale(1.1) translateX(0px); }
            50% { transform: scale(1.15) translateX(-25px); }
            100% { transform: scale(1.1) translateX(0px); }
          }
        `}
      </style>
    </div>
  );
}

export default ViewBookings;

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
    maxWidth: "1100px",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
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
  row: { borderBottom: "1px solid rgba(255,255,255,0.2)", transition: "all 0.25s ease" },
  statusBadge: {
    padding: "5px 12px",
    borderRadius: "999px",
    fontWeight: "bold",
    color: "#fff",
    fontSize: "0.8rem",
  },
  actionsCell: { display: "flex", gap: "10px", flexWrap: "wrap" },
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
  mobileList: { display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" },
  mobileCard: {
    background: "rgba(255,255,255,0.15)",
    borderRadius: "14px",
    padding: "16px",
    textAlign: "left",
    backdropFilter: "blur(10px)",
    transition: "transform 0.25s ease",
  },
  mobileRow: { marginBottom: "6px", fontSize: "0.95rem" },
  mobileActions: { display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" },
  message: { marginTop: "20px", fontWeight: "bold" },
  link: { display: "block", marginTop: "25px", color: "#fff", textDecoration: "underline" },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    minWidth: "320px",
    maxWidth: "500px",
    textAlign: "center",
    color: "#000",
  },
  cancelBtn: {
    marginTop: "15px",
    padding: "8px 15px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#ef6c00",
    color: "#fff",
    cursor: "pointer",
  },
};