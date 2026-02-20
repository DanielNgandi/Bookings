import prisma from "../config/prisma.js";

export const addClient = async (req, res) => {
  const { name, company, email, phone, country } = req.body;

  const userId = req.user.id; // ✅ Correct for your middleware

  if (!name) {
    return res.status(400).json({ message: "Client name is required" });
  }

  try {
    const client = await prisma.client.create({
      data: {
        name,
        company,
        email,
        phone,
        country,
        userId
      }
    });

    res.status(201).json({
      message: "Client created successfully",
      client
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });

    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

