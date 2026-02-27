import prisma from "../config/prisma.js";
import { generateInvoice, generateVoucher, generateReceipt } from "../utils/pdfGenerator.js";


// Generate Invoice Number
const generateInvoiceNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
};
export const downloadInvoice = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        client: true,
        hotel: true,
        invoice: true,
        items: true, // ⭐ VERY IMPORTANT
        payments: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    generateInvoice(res, booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating invoice" });
  }
};
export const downloadVoucher = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        client: true,
        hotel: true,
        voucher: true, 
        items: true, 
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Log to verify we're getting the data
    console.log("Generating voucher for booking:", booking.id);
    
    generateVoucher(res, booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating voucher" });
  }
};
export const downloadReceipt = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);

    if (isNaN(bookingId)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: req.user.id,
      },
      include: {
        client: true,
        hotel: true,
        payments: true,
        receipts: true,
      },
    });

    // ✅ IMPORTANT — check booking first
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // ✅ latest SUCCESS payment
    const latestPayment = booking.payments
      .filter((p) => p.status === "SUCCESS")
      .sort(
        (a, b) =>
          new Date(b.paymentDate) - new Date(a.paymentDate)
      )[0];

    if (!latestPayment) {
      return res.status(400).json({
        message: "No successful payment yet",
      });
    }

    // ✅ latest receipt (optional but preferred)
    const latestReceipt =
      booking.receipts?.sort(
        (a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
      )[0] || null;

    return generateReceipt(res, booking, latestPayment, latestReceipt);
  } catch (error) {
    console.error("Receipt download error:", error);
    res.status(500).json({ message: "Server error generating receipt" });
  }
};

// Create Booking + Auto-Invoice with multiple service items
export const createBooking = async (req, res) => {
  const { clientId, hotelId, checkIn, checkOut, items } = req.body;

  if (!clientId || !hotelId || !checkIn || !checkOut || !items || !items.length) {
    return res.status(400).json({ message: "All booking fields and items are required" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Validate client
      const client = await tx.client.findFirst({
        where: { id: Number(clientId), userId: req.user.id }
      });
      if (!client) throw new Error("Client not found");

      // Validate hotel
      const hotel = await tx.hotel.findFirst({
        where: { id: Number(hotelId), userId: req.user.id }
      });
      if (!hotel) throw new Error("Hotel not found");

      // Calculate total amount
      const totalAmount = items.reduce((sum, i) => sum + Number(i.amount || 0), 0);

      // Create booking
      const booking = await tx.booking.create({
        data: {
          userId: req.user.id,
          clientId: Number(clientId),
          hotelId: Number(hotelId),
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          rooms: items.length, 
          totalAmount,
          items: {
            create: items.map(i => ({
              date: new Date(i.date),
              service: i.service,
              pax: Number(i.pax),
              costPP: Number(i.costPP),
              amount: Number(i.amount)
            }))
          }
        },
        include: { items: true }
      });

      // Create invoice
      const invoice = await tx.invoice.create({
        data: { bookingId: booking.id, invoiceNumber: generateInvoiceNumber() }
      });

      return { booking, invoice };
    });

    res.status(201).json({
      message: "Booking created & invoice generated",
      booking: result.booking,
      invoice: result.invoice
    });

  } catch (error) {
    console.error(error);
    if (error.message === "Client not found" || error.message === "Hotel not found") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};


// Get all bookings (for logged-in tour operator)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        client: true,
        hotel: true,
        payments: true,
        invoice: true,
        voucher: true,
        receipts: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // ✅ enrich bookings for frontend
    const enrichedBookings = bookings.map((b) => {
      const paidAmount = b.payments.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0
      );

      const remainingBalance =
        Number(b.totalAmount || 0) - paidAmount;

      let paymentStatus = "pending";
      if (remainingBalance <= 0) paymentStatus = "paid";
      else if (paidAmount > 0) paymentStatus = "partial";

      return {
        ...b,
        paidAmount,
        remainingBalance,
        paymentStatus,
      };
    });

    res.status(200).json(enrichedBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get one booking
export const getSingleBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: Number(id),
        userId: req.user.id,
      },
      include: {
        client: true,
        hotel: true,
        payments: true,
        invoice: true,
        voucher: true,
        receipts: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const paidAmount = booking.payments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    const remainingBalance =
      Number(booking.totalAmount || 0) - paidAmount;

    let paymentStatus = "pending";
    if (remainingBalance <= 0) paymentStatus = "paid";
    else if (paidAmount > 0) paymentStatus = "partial";

    res.status(200).json({
      ...booking,
      paidAmount,
      remainingBalance,
      paymentStatus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
