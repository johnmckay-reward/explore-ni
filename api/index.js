// Load environment variables from .env file
require('dotenv').config();

// Import the express library
const express = require('express');

// Import the cors library
const cors = require('cors');

// Import models and database configuration
const { sequelize, User, Experience, Booking, Availability, Voucher, Review, Category } = require('./models');
const { seedDatabase } = require('./config/seed');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const experienceRoutes = require('./routes/experience.routes');
const publicRoutes = require('./routes/public.routes');
const availabilityRoutes = require('./routes/availability.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const webhookRoutes = require('./routes/webhook.routes');

// Initialize the express application
const app = express();

// Enable CORS for all routes
app.use(cors());

// *** IMPORTANT: Webhooks need raw body, so add this BEFORE express.json() ***
// Mount webhook routes first (they need raw body for signature verification)
app.use('/api/webhooks', webhookRoutes);

// *** ADDED: Enable express.json() middleware ***
// This is crucial for parsing JSON request bodies (e.g., from a POST request)
app.use(express.json());

// Define the port the server will run on
const port = process.env.PORT || 3000;

// --- Routes ---

// Define a route for the root URL ('/')
app.get('/', (req, res) => {
  res.send({
    message: 'Hello Explore NI!',
  });
});

// Mount public routes (no authentication required)
app.use('/api/public', publicRoutes);

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Mount user routes
app.use('/api/users', userRoutes);

// Mount admin routes
app.use('/api/admin', adminRoutes);

// Mount experience routes
app.use('/api/experiences', experienceRoutes);

// Mount booking routes (MUST be before availability routes to avoid auth middleware)
app.use('/api/bookings', bookingRoutes);

// Mount payment routes (MUST be before availability routes to avoid auth middleware)
app.use('/api/payments', paymentRoutes);

// Mount availability routes (has auth middleware, mount LAST among /api routes)
app.use('/api', availabilityRoutes);

// --- Server Start ---

// We wrap the server start in an async function
// to ensure the database is synced before we start listening for requests.
const startServer = async () => {
  try {
    // Sync all models with the database
    // { force: true } drops the tables if they already exist (useful for in-memory dev)
    await sequelize.sync({ force: true });
    console.log('Database & tables created!');
    console.log('Models initialized: User, Experience, Booking, Availability, Voucher, Review, Category');

    // Seed the database with development data
    // COMMENT OUT the line below if you don't want to seed data on startup
    await seedDatabase();

    // Start the server and make it listen for connections
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// 4. Call the function to start the server
startServer();

// Export for testing purposes
module.exports = app;