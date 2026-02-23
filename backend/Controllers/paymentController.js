import prisma from "../config/prisma.js";

// Generate secure Receipt Number
const generateReceiptNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000); // more unique
  return `RCPT-${timestamp}-${random}`;
};

// Create Payment + Auto Receipt + Update Booking
export const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, method, transactionId } = req.body;

    // ✅ Validate inputs
    if (!bookingId || !amount || !method) {
      return res.status(400).json({
        message: "bookingId, amount, and method are required"
      });
    }

    const bookingIdNum = Number(bookingId);
    const paymentAmount = parseFloat(amount);

    if (isNaN(bookingIdNum) || bookingIdNum <= 0) {
      return res.status(400).json({ message: "Invalid bookingId" });
    }

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const validMethods = ["MPESA", "BANK", "CASH"];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    // ✅ Transaction-safe creation
    const result = await prisma.$transaction(async (tx) => {

      // 1️⃣ Check booking belongs to logged-in user
      const booking = await tx.booking.findFirst({
        where: {
          id: bookingIdNum,
          userId: req.user.id
        }
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      // 2️⃣ Prevent double payment
      const existingPayment = await tx.payment.findUnique({
        where: { bookingId: bookingIdNum }
      });

      if (existingPayment) {
        throw new Error("Payment already recorded");
      }

      // 3️⃣ Create Payment
      const payment = await tx.payment.create({
        data: {
          bookingId: bookingIdNum,
          amount: paymentAmount,
          method,
          transactionId: transactionId?.trim() || null
        }
      });

      // 4️⃣ Update Booking status → PAID
      await tx.booking.update({
        where: { id: bookingIdNum },
        data: { status: "PAID" }
      });

      // 5️⃣ Create Receipt automatically
      const receipt = await tx.receipt.create({
        data: {
          bookingId: bookingIdNum,
          receiptNumber: generateReceiptNumber()
        }
      });

      return { payment, receipt };
    });

    res.status(201).json({
      message: "Payment recorded & receipt generated successfully",
      payment: result.payment,
      receipt: result.receipt
    });

  } catch (error) {
    console.error("Payment error:", error);

    // ✅ Client-safe messages
    const clientErrors = ["Booking not found", "Payment already recorded", "Invalid payment method"];
    if (clientErrors.includes(error.message)) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error while processing payment" });
  }
};