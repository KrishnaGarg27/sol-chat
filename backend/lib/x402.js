// x402 Payment Required protocol - returns 402 with Solana payment details

const { v4: uuidv4 } = require('uuid');
const { CREDIT_PRICE_LAMPORTS, PAYMENT_EXPIRY_MS } = require('../config/constants');
const solanaService = require('./solana');

class X402Facilitator {
  constructor() {
    this.pendingPayments = new Map();
  }

  createPaymentRequest({ creditsRequired, userId, userType, userWallet }) {
    const reference = uuidv4();
    const paymentDetails = solanaService.generatePaymentDetails(creditsRequired, CREDIT_PRICE_LAMPORTS);
    
    const paymentRequest = {
      reference,
      creditsRequired,
      userId,
      userType,
      userWallet,
      amount: paymentDetails.amount,
      currency: 'lamports',
      recipient: paymentDetails.recipient,
      network: paymentDetails.network,
      memo: paymentDetails.memo,
      expiresAt: new Date(Date.now() + PAYMENT_EXPIRY_MS).toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    this.pendingPayments.set(reference, { ...paymentRequest, status: 'pending' });
    
    // Auto-expire
    setTimeout(() => {
      const payment = this.pendingPayments.get(reference);
      if (payment?.status === 'pending') payment.status = 'expired';
    }, PAYMENT_EXPIRY_MS);
    
    return paymentRequest;
  }

  getPendingPayment(reference) {
    return this.pendingPayments.get(reference) || null;
  }

  completePayment(reference, signature) {
    const payment = this.pendingPayments.get(reference);
    if (payment) {
      payment.status = 'completed';
      payment.signature = signature;
      payment.completedAt = new Date().toISOString();
    }
  }

  failPayment(reference, error) {
    const payment = this.pendingPayments.get(reference);
    if (payment) {
      payment.status = 'failed';
      payment.error = error;
    }
  }

  sendPaymentRequired(res, paymentRequest) {
    res.status(402).json({
      error: 'Payment Required',
      code: 'INSUFFICIENT_CREDITS',
      payment: {
        reference: paymentRequest.reference,
        network: paymentRequest.network,
        recipient: paymentRequest.recipient,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        memo: paymentRequest.memo,
        credits: paymentRequest.creditsRequired,
        expiresAt: paymentRequest.expiresAt,
        verifyUrl: `/api/pay/verify/${paymentRequest.reference}`,
      },
      message: `Need ${paymentRequest.creditsRequired} credits. Send ${paymentRequest.amount} lamports to ${paymentRequest.recipient}.`,
    });
  }

  async verifyPayment(reference, signature, payerWallet) {
    const pendingPayment = this.getPendingPayment(reference);
    
    if (!pendingPayment) return { success: false, error: 'Payment reference not found' };
    if (pendingPayment.status === 'completed') return { success: false, error: 'Already processed' };
    if (pendingPayment.status === 'expired') return { success: false, error: 'Payment expired' };
    
    const verification = await solanaService.verifyPayment(
      signature,
      payerWallet,
      parseInt(pendingPayment.amount)
    );
    
    if (!verification.valid) {
      this.failPayment(reference, verification.error);
      return { success: false, error: verification.error };
    }
    
    this.completePayment(reference, signature);
    
    return {
      success: true,
      credits: pendingPayment.creditsRequired,
      userId: pendingPayment.userId,
      userType: pendingPayment.userType,
      userWallet: pendingPayment.userWallet,
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [reference, payment] of this.pendingPayments.entries()) {
      // Remove payments expired for over 1 hour
      if (now - new Date(payment.expiresAt).getTime() > 60 * 60 * 1000) {
        this.pendingPayments.delete(reference);
      }
    }
  }
}

const facilitator = new X402Facilitator();

// Cleanup every 10 min
setInterval(() => facilitator.cleanup(), 10 * 60 * 1000);

module.exports = facilitator;
