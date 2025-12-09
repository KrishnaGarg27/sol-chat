const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema(
  {
    chatSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      required: true,
    },
    role: { type: String, enum: ["user", "assistant"] },
    model: { type: String },
    content: { type: String },
  },
  { timestamps: true }
);

const ChatSession = mongoose.model("ChatSession", ChatSessionSchema);

module.exports = ChatSession;
