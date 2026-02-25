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

    if (!bookingId || !amount || !method) {
      return res.status(400).json({
        message: "bookingId, amount, and method are required",
      });
    }

    const bookingIdNum = Number(bookingId);
    const paymentAmount = parseFloat(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
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
        throw new Error("Booking not found");
      }

      // ✅ Calculate already paid
      const alreadyPaid = booking.payments.reduce(
        (sum, p) => sum + p.amount,
        0
      );

      const remainingBalance = booking.totalAmount - alreadyPaid;

      // ✅ Prevent overpayment
      if (paymentAmount > remainingBalance) {
        throw new Error(
          `Payment exceeds remaining balance (${remainingBalance.toFixed(2)})`
        );
      }

      // ✅ Create payment (SUCCESS for manual mode)
      const payment = await tx.payment.create({
        data: {
          bookingId: bookingIdNum,
          amount: paymentAmount,
          method,
          transactionId: transactionId?.trim() || null,
          status: "SUCCESS",
        },
      });

      // ✅ Recalculate after payment
      const newPaidTotal = alreadyPaid + paymentAmount;

      let newStatus = "PENDING";
      if (newPaidTotal >= booking.totalAmount) {
        newStatus = "PAID";
      }

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
          receiptNumber: generateReceiptNumber(),
        },
      });

      return {
        payment,
        receipt,
        remainingBalance: booking.totalAmount - newPaidTotal,
      };
    });

    res.status(201).json({
      message: "Payment recorded successfully",
      ...result,
    });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(400).json({ message: error.message || "Payment failed" });
  }
};