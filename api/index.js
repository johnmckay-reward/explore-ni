// Import the express library
const express = require('express');

// Import the cors library
const cors = require('cors');

// Initialize the express application
const app = express();

// Enable CORS for all routes
app.use(cors());

// Define the port the server will run on
// You can use environment variables or a default value
const port = process.env.PORT || 3000;

// Define a route for the root URL ('/')
// When someone visits this URL, this function will handle the request
app.get('/', (req, res) => {
  // Send the "Hello World!" string as the response
  res.send('Hello World!');
});

// Start the server and make it listen for connections on the specified port
app.listen(port, () => {
  // Log a message to the console once the server is running
  console.log(`Example app listening at http://localhost:${port}`);
});

