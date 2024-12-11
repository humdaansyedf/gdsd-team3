import "dotenv/config";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import express from "express";
import cookieParser from "cookie-parser";
import { IS_DEV } from "./src/lib/utils.js";
import { authRouter, authMiddleware } from "./src/routes/auth.js";
import { propertyRouter } from "./src/routes/property.js";
import { fileRouter } from "./src/routes/file.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.PORT || 3000;

const app = express();
const server = createServer(app);

// Disable some headers
app.set("etag", false);
app.set("x-powered-by", false);

if (!IS_DEV) {
  // Serve the static files from the React app
  app.use(express.static(join(__dirname, "client/dist")));
}

// Middleware for parsing JSON bodies
app.use(express.json());

// Middleware for parsing URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Middleware for parsing cookie
app.use(cookieParser());

// Public routes
app.use("/api", authRouter, authMiddleware, propertyRouter, fileRouter);

// // Middleware for authenticating users
// app.use("/api", authMiddleware);

// // Private routes
// app.use("/api",);

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error(err.message, err.stack);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

// Redirect to the client in development
if (IS_DEV) {
  app.get("/", (_req, res) => {
    res.redirect("http://localhost:5173");
  });
}

if (!IS_DEV) {
  // Handles any requests that don't match the ones above
  app.get("*", (_req, res) => {
    res.sendFile(join(__dirname + "/client/dist/index.html"));
  });
}

// Start the server
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port} 🚀`);
});
