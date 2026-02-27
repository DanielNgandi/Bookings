import prisma from "../config/prisma.js";

// Generate secure Receipt Number
const generateReceiptNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  return `RCPT-${timestamp}-${random}`;
};

export const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, method, transactionId } = req.body;

    // ✅ Basic validation
    if (!bookingId || !amount || !method) {
      return res.status(400).json({
        success: false,
        message: "bookingId, amount, and method are required",
      });
    }

    const bookingIdNum = Number(bookingId);
    const paymentAmount = parseFloat(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // ✅ Get booking
      const booking = await tx.booking.findFirst({
        where: {
          id: bookingIdNum,
          userId: req.user.id,
        },
        include: {
          payments: {
            where: { status: "SUCCESS" },
          },
        },
      });

      if (!booking) {
        const err = new Error("BOOKING_NOT_FOUND");
        err.code = "BOOKING_NOT_FOUND";
        throw err;
      }

      // ✅ Calculate already paid
      const alreadyPaid = booking.payments.reduce(
        (sum, p) => sum + p.amount,
        0
      );

      const remainingBalance = booking.totalAmount - alreadyPaid;

      // ✅ Prevent overpayment (CLEAN ERROR)
      if (paymentAmount > remainingBalance) {
        const err = new Error("OVERPAYMENT");
        err.code = "OVERPAYMENT";
        err.remainingBalance = remainingBalance;
        throw err;
      }

      // ✅ Create payment
      const payment = await tx.payment.create({
        data: {
          bookingId: bookingIdNum,
          amount: paymentAmount,
          method,
          transactionId: transactionId?.trim() || null,
          status: "SUCCESS",
        },
      });

      // ✅ Recalculate totals
      const newPaidTotal = alreadyPaid + paymentAmount;

      const newStatus =
        newPaidTotal >= booking.totalAmount ? "PAID" : "PENDING";

      // ✅ Update booking
      await tx.booking.update({
        where: { id: bookingIdNum },
        data: {
          status: newStatus,
          lastPaymentDate: new Date(),
        },
      });

      // ✅ Create receipt
      const receipt = await tx.receipt.create({
        data: {
          bookingId: bookingIdNum,
          paymentId: payment.id,
          receiptNumber: generateReceiptNumber(),
        },
      });

      return {
        payment,
        receipt,
        remainingBalance: booking.totalAmount - newPaidTotal,
      };
    });

    // ✅ SUCCESS RESPONSE
    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      ...result,
    });
  } catch (error) {
  // ✅ OVERPAYMENT — handled quietly
  if (error.code === "OVERPAYMENT") {
    return res.status(400).json({
      success: false,
      type: "OVERPAYMENT",
      message: `Payment exceeds remaining balance (${error.remainingBalance.toFixed(2)})`,
      remainingBalance: error.remainingBalance,
    });
  }

  // ✅ BOOKING NOT FOUND — handled quietly
  if (error.code === "BOOKING_NOT_FOUND") {
    return res.status(404).json({
      success: false,
      message: "Booking not found",
    });
  }

  // 🚨 ONLY unexpected errors get logged
  console.error("UNEXPECTED PAYMENT ERROR:", error);

  return res.status(500).json({
    success: false,
    message: "Payment failed. Please try again.",
  });
}
};