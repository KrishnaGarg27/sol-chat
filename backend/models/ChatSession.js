const mongoose = require("mongoose");

const ChatSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String },
    models: [String],
    status: { type: String, enum: ["active", "completed"] },
  },
  { timestamps: true }
);

const ChatSession = mongoose.model("ChatSession", ChatSessionSchema);

module.exports = ChatSession;
