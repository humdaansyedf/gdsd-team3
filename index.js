const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

// Middleware for parsing JSON bodies
app.use(express.json());
// Middleware for parsing URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
