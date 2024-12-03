require("dotenv").config();
const path = require("node:path");
const http = require("node:http");
const express = require("express");
const { isDev } = require("./src/lib/utils");
const { propertyRouter } = require("./src/routes/property");

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

// Disable some headers
app.set("etag", false);
app.set("x-powered-by", false);

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, "client/dist")));

// Middleware for parsing JSON bodies
app.use(express.json());

// Middleware for parsing URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", propertyRouter);

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error(err.message, err.stack);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

// Redirect to the client in development
if (isDev) {
  app.get("/", (_req, res) => {
    res.redirect("http://localhost:5173");
  });
}

// Handles any requests that don't match the ones above
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname + "/client/dist/index.html"));
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port} 🚀`);
});
