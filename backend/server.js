// server.js
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './Routers/authRoutes.js';
import clientRoutes from './Routers/clientRoutes.js';
import hotelRoutes from './Routers/hotelRoutes.js';
import bookingRoutes from './Routers/bookingRoutes.js';
import paymentRoutes from './Routers/paymentRoutes.js';

import cors from 'cors';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});
//console.log("DB URL:", process.env.DATABASE_URL);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
