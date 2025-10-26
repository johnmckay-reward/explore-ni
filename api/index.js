// Import the express library
const express = require('express');

// Import the cors library
const cors = require('cors');

// Import Sequelize
const { Sequelize, DataTypes } = require('sequelize');

// --- Sequelize Setup ---

// 1. Initialize Sequelize to use in-memory SQLite
// 'sqlite::memory:' tells Sequelize to use SQLite in a temporary in-memory database
const sequelize = new Sequelize('sqlite::memory:');

// 2. Define a Model
// This creates a model named 'Item' which will correspond to an 'Items' table
// It has one column: 'name' of type STRING
const Item = sequelize.define('Item', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// -------------------------

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

// *** NEW: POST endpoint to add an item ***
// This endpoint listens for POST requests at /items
app.post('/items', async (req, res) => {
  try {
    // We get the 'name' from the request body (which express.json() parsed for us)
    const { name } = req.body;

    // A simple validation
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Create a new item in the database using our 'Item' model
    const newItem = await Item.create({ name });

    // Send the newly created item back as a response with a 201 (Created) status
    res.status(201).json(newItem);
  } catch (error) {
    // Basic error handling
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// *** NEW: GET endpoint to retrieve all items ***
// This endpoint listens for GET requests at /items
app.get('/items', async (req, res) => {
  try {
    // Find all items in the database using our 'Item' model
    const items = await Item.findAll();

    // Send the list of items back as a JSON array
    res.json(items);
  } catch (error) {
    // Basic error handling
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// --- Server Start ---

// We wrap the server start in an async function
// to ensure the database is synced before we start listening for requests.
const startServer = async () => {
  try {
    // 3. Sync all models with the database
    // This creates the tables (e.g., the 'Items' table)
    // { force: true } drops the table if it already exists (useful for in-memory dev)
    await sequelize.sync({ force: true });
    console.log('Database & tables created!');

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