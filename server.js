require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const Player = require("./models/Player");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;


const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(console.error);

// REST API to fetch top N players with filters
app.get("/leaderboard", async (req, res) => {
  try {
    const { limit = 10, region, gameMode } = req.query;

    const filter = {};
    if (region) filter.region = region;
    if (gameMode) filter.gameMode = gameMode;

    const players = await Player.find(filter)
      .sort({ score: -1 })
      .limit(Number(limit));

    res.json(players);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Socket.IO WebSocket connection
io.on("connection", (socket) => {
  console.log("🟢 Client connected");

  socket.on("updateScore", async (data) => {
    try {
      const { username, score, region, gameMode } = data;
      if (!username || score === undefined || !region || !gameMode) return;

      // Upsert player score + update timestamp (for TTL)
      await Player.findOneAndUpdate(
        { username, region, gameMode },
        { score, updatedAt: new Date() },
        { upsert: true, new: true }
      );

      // Fetch top 10 players filtered by region and gameMode
      const topPlayers = await Player.find({ region, gameMode })
        .sort({ score: -1 })
        .limit(10);

      // Broadcast the leaderboard update to all clients
      io.emit("leaderboardUpdate", topPlayers);

    } catch (err) {
      console.error("Error updating score:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected");
  });
});

server.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
