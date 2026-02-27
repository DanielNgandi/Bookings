import { useState, useEffect } from "react";
import API from "../service/api.js";
import Swal from "sweetalert2";

function AddPayment({ bookingId, totalAmount = 0, onPaymentSuccess }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("BANK");
  const [transactionId, setTransactionId] = useState("");
  const [remainingBalance, setRemainingBalance] = useState(totalAmount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [receiptLink, setReceiptLink] = useState("");
  const [isPaidOff, setIsPaidOff] = useState(false);

  // ✅ keep balance in sync with parent
  useEffect(() => {
    setRemainingBalance(Number(totalAmount) || 0);
  }, [totalAmount]);

  // ✅ auto-fill amount when balance changes
  useEffect(() => {
    if (remainingBalance <= 0) {
      setIsPaidOff(true);
      setAmount("0");
    } else {
      setIsPaidOff(false);
      setAmount(Number(remainingBalance).toFixed(2));
    }
  }, [remainingBalance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isPaidOff) {
      setError("This booking is already fully paid.");
      return;
    }

    const payAmount = parseFloat(amount);

    // ✅ validation
    if (isNaN(payAmount) || payAmount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    if (payAmount > remainingBalance) {
      setError(
        `Amount exceeds remaining balance (${remainingBalance.toFixed(2)})`
      );
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/payments", {
        bookingId,
        amount: payAmount,
        method,
        transactionId: transactionId?.trim() || null,
      });

      // ✅ update balance from backend safely
      const newBalance = Number(res.data.remainingBalance ?? 0);
      setRemainingBalance(newBalance);
      Swal.fire({
  icon: "success",
  title: "Payment recorded",
  text: "Receipt generated successfully",
  confirmButtonColor: "#16a34a",
});

      // ✅ receipt link (safe fallback)
      if (res.data.receipt?.id) {
        setReceiptLink(`/receipts/${res.data.receipt.id}`);
      } else {
        setReceiptLink(`/bookings/${bookingId}/receipt`);
      }

      onPaymentSuccess?.();
    } catch (err) {
  const data = err.response?.data;

  // ⭐ OVERPAYMENT POPUP
  if (data?.type === "OVERPAYMENT") {
    Swal.fire({
      icon: "warning",
      title: "Overpayment detected",
      text: data.message,
      confirmButtonColor: "#dc2626",
    });

    // sync remaining balance from backend
    if (typeof data.remainingBalance === "number") {
      setRemainingBalance(data.remainingBalance);
    }

    return;
  }

  // ⭐ other errors
  Swal.fire({
    icon: "error",
    title: "Payment Failed",
    text: data?.message || "Something went wrong",
    confirmButtonColor: "#dc2626",
  });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>💳 Record Payment</h2>
          <p style={styles.subtitle}>Secure booking payment</p>
        </div>

        <div style={styles.summaryBox}>
          <div style={styles.summaryRow}>
            <span>Total Cost</span>
            <strong>${Number(totalAmount).toFixed(2)}</strong>
          </div>
          <div style={styles.summaryRow}>
            <span>Remaining Balance</span>
            <strong
              style={{
                color: remainingBalance <= 0 ? "#16a34a" : "#dc2626",
              }}
            >
              ${Number(remainingBalance).toFixed(2)}
            </strong>
          </div>
        </div>

        {isPaidOff && (
          <div style={styles.successBox}>
            ✅ This booking is fully paid
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Amount Paying</label>
            <input
              style={styles.input}
              type="number"
              step="0.01"
              min="0"
              max={remainingBalance}
              value={amount}
              disabled={isPaidOff}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Payment Method</label>
            <select
              style={styles.input}
              value={method}
              disabled={isPaidOff}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="BANK">🏦 Bank Transfer</option>
              <option value="MPESA">📱 M-Pesa</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Transaction ID</label>
            <input
              style={styles.input}
              type="text"
              value={transactionId}
              disabled={isPaidOff}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Optional reference"
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={loading || isPaidOff}
            style={{
              ...styles.payBtn,
              ...(loading || isPaidOff ? styles.btnDisabled : {}),
            }}
          >
            {isPaidOff
              ? "Fully Paid"
              : loading
              ? "Processing Payment..."
              : "Confirm Payment"}
          </button>
        </form>

        {receiptLink && (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✅</div>
            <p style={{ marginBottom: 10 }}>
              Payment recorded successfully
            </p>
            <a
              href={receiptLink}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.receiptLink}
            >
              Download Receipt
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddPayment;
const styles = {
  wrapper: {
  width: "100%",
  display: "flex",
  justifyContent: "center",
},

  card: {
    width: "100%",
    maxWidth: 480,
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(10px)",
    padding: 30,
    borderRadius: 20,
    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
  },

  header: {
    textAlign: "center",
    marginBottom: 20,
  },

  title: {
    margin: 0,
    color: "#0f172a",
  },

  subtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: 14,
  },

  summaryBox: {
    background: "#f8fafc",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    border: "1px solid #e2e8f0",
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
    fontSize: 14,
  },

  field: {
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
  },

  label: {
    marginBottom: 6,
    fontWeight: 600,
    color: "#334155",
    fontSize: 13,
  },

  input: {
    padding: "11px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    outline: "none",
    transition: "all 0.2s ease",
  },

  payBtn: {
    width: "100%",
    padding: 13,
    borderRadius: 12,
    border: "none",
    background:
      "linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 10,
    boxShadow: "0 10px 20px rgba(34,197,94,0.25)",
    transition: "all 0.15s ease",
  },

  btnDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 13,
    textAlign: "center",
  },

  successBox: {
    marginTop: 20,
    padding: 18,
    background: "#ecfdf5",
    borderRadius: 14,
    textAlign: "center",
    border: "1px solid #bbf7d0",
  },

  successIcon: {
    fontSize: 26,
    marginBottom: 6,
  },

  receiptLink: {
    display: "inline-block",
    padding: "8px 16px",
    borderRadius: 8,
    background: "#166534",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
  },
};