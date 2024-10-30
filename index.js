const express = require('express');
const app = express();
const port = 3000;

// Middleware for parsing JSON bodies
app.use(express.json());
// Middleware for parsing URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Example route with JSON response
app.get('/api/test', (req, res) => {
  res.json({
    message: 'This is a test endpoint',
    status: 'success'
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

