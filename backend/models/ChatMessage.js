const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  chatSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession', required: true, index: true },
  queryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage', index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  model: { type: String },
  content: { type: String, default: '' },
  status: { type: String, enum: ['incomplete', 'completed', 'error'], default: 'incomplete' },
  tokenCount: { type: Number },
}, { timestamps: true });

ChatMessageSchema.index({ chatSessionId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
