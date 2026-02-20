import prisma from "../config/prisma.js";
import { generateInvoice, generateVoucher } from "../utils/pdfGenerator.js";


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
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    generateVoucher(res, booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating voucher" });
  }
};

// Create Booking + Auto-Invoice
export const createBooking = async (req, res) => {
  const { clientId, hotelId, checkIn, checkOut, rooms, totalAmount } = req.body;

  if (!clientId || !hotelId || !checkIn || !checkOut || !rooms || !totalAmount) {
    return res.status(400).json({ message: "All booking fields are required" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {

      // 1️⃣ Validate client belongs to tour guide
      const client = await tx.client.findFirst({
        where: { id: Number(clientId), userId: req.user.id }
      });
      if (!client) throw new Error("Client not found");

      // 2️⃣ Validate hotel belongs to tour guide
      const hotel = await tx.hotel.findFirst({
        where: { id: Number(hotelId), userId: req.user.id }
      });
      if (!hotel) throw new Error("Hotel not found");

      // 3️⃣ Create Booking
      const booking = await tx.booking.create({
        data: {
          userId: req.user.id,
          clientId: Number(clientId),
          hotelId: Number(hotelId),
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          rooms,
          totalAmount: Number(totalAmount),
        }
      });

      // 4️⃣ Auto-generate Invoice
      const invoice = await tx.invoice.create({
        data: {
          bookingId: booking.id,
          invoiceNumber: generateInvoiceNumber()
        }
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

    if (
      error.message === "Client not found" ||
      error.message === "Hotel not found"
    ) {
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
        userId: req.user.id
      },
      include: {
        client: true,
        hotel: true,
        payment: true,   // singular
        invoice: true,
        voucher: true,
        receipt: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.status(200).json(bookings);

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
        userId: req.user.id
      },
      include: {
        client: true,
        hotel: true,
        payment: true, // singular
        invoice: true,
        voucher: true,
        receipt: true
      }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
