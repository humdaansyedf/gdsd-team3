import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { IS_DEV } from "./src/lib/utils.js";
import { fileRouter } from "./src/routes/file.js";
import { authMiddleware, authRouter } from "./src/routes/auth.js";
import { propertyRouter, publicPropertyRouter } from "./src/routes/property.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.PORT || 3000;

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: IS_DEV ? ["http://localhost:5173"] : false, // Allow client origin in development
  },
});

const ROOM_NAME = "global_room";

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Add the user to the global room
  socket.join(ROOM_NAME);
  console.log(`User ${socket.id} joined ${ROOM_NAME}`);

  // Broadcast to others in the room when a user joins
  socket.to(ROOM_NAME).emit("user_joined", { userId: socket.id });

  // Handle incoming messages
  socket.on("send_message", (data) => {
    console.log("Message received:", data);

    // Emit the message to everyone in the room
    io.to(ROOM_NAME).emit("receive_message", {
      from: socket.id,
      content: data.content,
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);

    // Notify others in the room
    socket.to(ROOM_NAME).emit("user_left", { userId: socket.id });
  });
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

// Public routes
app.use("/api", authRouter, publicPropertyRouter);

// Middleware for authenticating users
app.use("/api", authMiddleware);

// Private routes
app.use("/api", propertyRouter, fileRouter);

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
