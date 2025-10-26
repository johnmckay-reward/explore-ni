// Import the express library
const express = require('express');

// Import the cors library
const cors = require('cors');

// Import models and database configuration
const { sequelize, User, Experience, Booking, Availability, Voucher, Review, Category } = require('./models');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const experienceRoutes = require('./routes/experience.routes');

// Initialize the express application
const app = express();

// Enable CORS for all routes
app.use(cors());

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

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Mount user routes
app.use('/api/users', userRoutes);

// Mount admin routes
app.use('/api/admin', adminRoutes);

// Mount experience routes
app.use('/api/experiences', experienceRoutes);

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