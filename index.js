import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";
import { IS_DEV } from "./src/lib/utils.js";
import { adminRouter } from "./src/routes/admin.js";
import { authMiddleware, authRouter } from "./src/routes/auth.js";
import { creatorRouter } from "./src/routes/creator.js";
import { documentRouter } from "./src/routes/doc.js";
import { fileRouter } from "./src/routes/file.js";
import { profileRouter } from "./src/routes/profile.js";
import { propertyRouter, publicPropertyRouter } from "./src/routes/property.js";
import { wishlistRouter } from "./src/routes/wishlist.js";
import { chatRouter } from "./src/routes/chat.js";
import { chatHandlers } from "./src/lib/chatHandlers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.PORT || 3000;

const app = express();

app.use(
  cors({
    origin: IS_DEV ? ["http://localhost:5173"] : false, // Allow client origin in development
    credentials: true, // Allow cookies/auth headers
  })
);

const server = createServer(app);
// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: IS_DEV ? ["http://localhost:5173"] : false, // Allow client origin in development
  },
});

// Socket.IO Connection
io.on("connection", (socket) => {
  // Handle chat-related events
  chatHandlers(io, socket);
  socket.on("disconnect", () => {});
});

// Disable some headers
app.set("etag", false);
app.set("x-powered-by", false);

// Middleware for parsing JSON bodies
app.use(express.json());

// Middleware for parsing URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Middleware for parsing cookies
app.use(cookieParser());

// Admin routes
app.use("/api/admin", adminRouter);

// Public routes
app.use("/api", authRouter, publicPropertyRouter);

// Middleware for authenticating users
app.use("/api", authMiddleware);

// Private routes
app.use(
  "/api",
  propertyRouter,
  fileRouter,
  creatorRouter,
  wishlistRouter,
  chatRouter,
  documentRouter,
  profileRouter
);

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error("ERROR", err.message, err.stack);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

// Redirect to the client in development
if (IS_DEV) {
  app.get("/", (_req, res) => {
    res.redirect("http://localhost:5173");
  });
} else {
  // Serve the static files from the React app
  app.use(express.static(join(__dirname, "client/dist")));

  // Handles any requests that don't match the ones above
  app.get("*", (_req, res) => {
    res.sendFile(join(__dirname + "/client/dist/index.html"));
  });
}

// Start the server
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port} 🚀`);
});
