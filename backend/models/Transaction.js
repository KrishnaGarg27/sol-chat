const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
  type: { type: String, enum: ['credit_purchase', 'query_usage', 'refund'], required: true },
  creditsAmount: { type: Number, required: true },
  creditsBalanceAfter: { type: Number },
  solana: {
    signature: String,
    payerWallet: String,
    recipientWallet: String,
    amountLamports: Number,
    network: { type: String, enum: ['mainnet-beta', 'devnet', 'testnet'] },
    confirmedAt: Date,
  },
  usage: {
    chatSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession' },
    queryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage' },
    models: [String],
    costPerModel: Number,
  },
  paymentReference: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  error: { type: String },
}, { timestamps: true });

TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ guestId: 1, createdAt: -1 });
TransactionSchema.index({ 'solana.signature': 1 }, { sparse: true });
TransactionSchema.index({ paymentReference: 1 }, { sparse: true });

TransactionSchema.virtual('explorerUrl').get(function() {
  if (!this.solana?.signature) return null;
  const cluster = this.solana.network === 'mainnet-beta' ? '' : `?cluster=${this.solana.network}`;
  return `https://explorer.solana.com/tx/${this.solana.signature}${cluster}`;
});

TransactionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
