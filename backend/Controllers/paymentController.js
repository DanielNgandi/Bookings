import prisma from "../config/prisma.js";

// Generate secure Receipt Number
const generateReceiptNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  return `RCPT-${timestamp}-${random}`;
};

// ===== SERVER PAYMENT VALIDATOR =====
const validatePaymentServer = ({ bookingId, amount, method }) => {
  if (!bookingId || !amount || !method) {
    return "bookingId, amount, and method are required";
  }

  const amt = Number(amount);

  if (isNaN(amt) || amt <= 0) {
    return "Invalid payment amount";
  }

  if (!["BANK", "MPESA"].includes(method)) {
    return "Invalid payment method";
  }

  return null;
};

export const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, method, transactionId } = req.body;

    // ✅ SINGLE SOURCE OF TRUTH VALIDATION
    const validationError = validatePaymentServer({
      bookingId,
      amount,
      method,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const bookingIdNum = Number(bookingId);
    const paymentAmount = Number(amount);

    const result = await prisma.$transaction(async (tx) => {
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

      const alreadyPaid = booking.payments.reduce(
        (sum, p) => sum + p.amount,
        0
      );

      const remainingBalance = booking.totalAmount - alreadyPaid;

      if (paymentAmount > remainingBalance) {
        const err = new Error("OVERPAYMENT");
        err.code = "OVERPAYMENT";
        err.remainingBalance = remainingBalance;
        throw err;
      }

      const payment = await tx.payment.create({
        data: {
          bookingId: bookingIdNum,
          amount: paymentAmount,
          method,
          transactionId: transactionId?.trim() || null,
          status: "SUCCESS",
        },
      });

      const newPaidTotal = alreadyPaid + paymentAmount;

      const newStatus =
        newPaidTotal >= booking.totalAmount ? "PAID" : "PENDING";

      await tx.booking.update({
        where: { id: bookingIdNum },
        data: {
          status: newStatus,
          lastPaymentDate: new Date(),
        },
      });

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

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      ...result,
    });
  } catch (error) {
    if (error.code === "OVERPAYMENT") {
      return res.status(400).json({
        success: false,
        type: "OVERPAYMENT",
        message: `Payment exceeds remaining balance (${error.remainingBalance.toFixed(2)})`,
        remainingBalance: error.remainingBalance,
      });
    }

    if (error.code === "BOOKING_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    console.error("UNEXPECTED PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Payment failed. Please try again.",
    });
  }
};