import prisma from "../config/prisma.js";

// Generate Receipt Number
const generateReceiptNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `RCPT-${timestamp}-${random}`;
};

// Create Payment + Auto Receipt + Update Booking
export const createPayment = async (req, res) => {
  const { bookingId, amount, method, transactionId } = req.body;

  if (!bookingId || !amount || !method) {
    return res.status(400).json({
      message: "bookingId, amount and method are required"
    });
  }

  try {

    const result = await prisma.$transaction(async (tx) => {

      // 1️⃣ Check booking belongs to logged-in user
      const booking = await tx.booking.findFirst({
        where: {
          id: Number(bookingId),
          userId: req.user.id
        }
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      // 2️⃣ Prevent double payment
      const existingPayment = await tx.payment.findUnique({
        where: { bookingId: Number(bookingId) }
      });

      if (existingPayment) {
        throw new Error("Payment already recorded");
      }

      // 3️⃣ Validate method
      const validMethods = ["MPESA", "BANK", "CASH"];
      if (!validMethods.includes(method)) {
        throw new Error("Invalid payment method");
      }

      // 4️⃣ Create Payment
      const payment = await tx.payment.create({
        data: {
          bookingId: Number(bookingId),
          amount: Number(amount),
          method,
          transactionId: transactionId || null
        }
      });

      // 5️⃣ Update Booking status → PAID
      await tx.booking.update({
        where: { id: Number(bookingId) },
        data: { status: "PAID" }
      });

      // 6️⃣ Create Receipt automatically
      const receipt = await tx.receipt.create({
        data: {
          bookingId: Number(bookingId),
          receiptNumber: generateReceiptNumber()
        }
      });

      return { payment, receipt };
    });

    res.status(201).json({
      message: "Payment recorded & receipt generated",
      payment: result.payment,
      receipt: result.receipt
    });

  } catch (error) {
    console.error(error);

    if (
      error.message === "Booking not found" ||
      error.message === "Payment already recorded" ||
      error.message === "Invalid payment method"
    ) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};
