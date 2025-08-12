const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Connected to server");

  socket.emit("updateScore", {
    username: "Alice",
    score: Math.floor(Math.random() * 1000),
    region: "US",
    gameMode: "deathmatch",
  });
});

socket.on("leaderboardUpdate", (data) => {
  console.log("📊 Leaderboard update:", data);
});

socket.on("disconnect", () => {
  console.log("🔴 Disconnected from server");
});
