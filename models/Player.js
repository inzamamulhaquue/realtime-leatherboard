const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  score: { type: Number, required: true, default: 0 },
  region: { type: String, required: true },
  gameMode: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

// TTL index to auto-delete documents older than 1 day (for daily reset)
playerSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

// Compound index for filtering and sorting
playerSchema.index({ region: 1, gameMode: 1, score: -1 });

module.exports = mongoose.model("Player", playerSchema);
