import prisma from "../config/prisma.js";

export const addHotel = async (req, res) => {
  const { name, location, email, phone, mpesaNumber, bankDetails } = req.body;

  const userId = req.user.id; // ✅ Correct

  if (!name) {
    return res.status(400).json({ message: "Hotel name is required" });
  }

  try {
    const hotel = await prisma.hotel.create({
      data: {
        name,
        location,
        email,
        phone,
        mpesaNumber,
        bankDetails,
        userId
      }
    });

    res.status(201).json({
      message: "Hotel created successfully",
      hotel
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
