const mongoose = require('mongoose');

const GuestSchema = new mongoose.Schema({
  solanaWallet: { type: String },
  tokenAccount: { type: String },
  delegateAuthorized: { type: Boolean, default: false },
  delegateAmount: { type: Number, default: 0 },
  pendingPayment: {
    reference: String,
    amount: Number,
    credits: Number,
    createdAt: Date,
    expiresAt: Date,
  },
  sessionId: { type: String },
}, { timestamps: true });

GuestSchema.virtual('hasWallet').get(function() {
  return !!this.solanaWallet;
});

module.exports = mongoose.model('Guest', GuestSchema);
