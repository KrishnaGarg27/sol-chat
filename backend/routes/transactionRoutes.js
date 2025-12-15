// Transaction history routes

const express = require('express');
const router = express.Router();

const Transaction = require('../models/Transaction');
const ChatSession = require('../models/ChatSession');
const { ensureSession } = require('../middlewares/authMiddlewares');

const getExplorerUrl = (sig, network) => sig ? `https://explorer.solana.com/tx/${sig}${network === 'mainnet-beta' ? '' : `?cluster=${network}`}` : null;

router.get('/', ensureSession, async (req, res) => {
  try {
    const { account, accountType } = req;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    
    const query = { [accountType === 'user' ? 'userId' : 'guestId']: account._id };
    if (req.query.type) query.type = req.query.type;
    if (req.query.status) query.status = req.query.status;
    
    const [total, transactions] = await Promise.all([
      Transaction.countDocuments(query),
      Transaction.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ]);
    
    const enriched = await Promise.all(transactions.map(async tx => {
      const result = {
        id: tx._id,
        type: tx.type,
        creditsAmount: tx.creditsAmount,
        status: tx.status,
        createdAt: tx.createdAt,
      };
      
      if (tx.solana?.signature) {
        result.solana = {
          signature: tx.solana.signature,
          amountLamports: tx.solana.amountLamports,
          amountSOL: tx.solana.amountLamports / 1e9,
          explorerUrl: getExplorerUrl(tx.solana.signature, tx.solana.network),
        };
      }
      
      if (tx.usage?.chatSessionId) {
        const session = await ChatSession.findById(tx.usage.chatSessionId).select('title').lean();
        result.usage = {
          chatSessionId: tx.usage.chatSessionId,
          chatSessionTitle: session?.title || 'Untitled',
          models: tx.usage.models,
        };
      }
      
      return result;
    }));
    
    res.json({
      transactions: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions', code: 'GET_TRANSACTIONS_ERROR' });
  }
});

router.get('/summary', ensureSession, async (req, res) => {
  try {
    const { account, accountType } = req;
    const baseQuery = { [accountType === 'user' ? 'userId' : 'guestId']: account._id, status: 'completed' };
    
    const [purchases, usage] = await Promise.all([
      Transaction.aggregate([
        { $match: { ...baseQuery, type: 'credit_purchase' } },
        { $group: { _id: null, totalCredits: { $sum: '$creditsAmount' }, totalLamports: { $sum: '$solana.amountLamports' }, count: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        { $match: { ...baseQuery, type: 'query_usage' } },
        { $group: { _id: null, totalCredits: { $sum: { $abs: '$creditsAmount' } }, count: { $sum: 1 } } },
      ]),
    ]);
    
    const p = purchases[0] || { totalCredits: 0, totalLamports: 0, count: 0 };
    const u = usage[0] || { totalCredits: 0, count: 0 };
    
    res.json({
      purchases: { totalCredits: p.totalCredits, totalSpentSOL: p.totalLamports / 1e9, count: p.count },
      usage: { totalCreditsUsed: u.totalCredits, queryCount: u.count },
      netCredits: p.totalCredits - u.totalCredits,
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to get summary', code: 'GET_SUMMARY_ERROR' });
  }
});

router.get('/:transactionId', ensureSession, async (req, res) => {
  try {
    const { account, accountType } = req;
    const tx = await Transaction.findOne({
      _id: req.params.transactionId,
      [accountType === 'user' ? 'userId' : 'guestId']: account._id,
    }).lean();
    
    if (!tx) return res.status(404).json({ error: 'Not found', code: 'TRANSACTION_NOT_FOUND' });
    
    const response = { id: tx._id, type: tx.type, creditsAmount: tx.creditsAmount, status: tx.status, createdAt: tx.createdAt };
    
    if (tx.solana) {
      response.solana = {
        signature: tx.solana.signature,
        amountLamports: tx.solana.amountLamports,
        network: tx.solana.network,
        explorerUrl: getExplorerUrl(tx.solana.signature, tx.solana.network),
      };
    }
    
    if (tx.usage) {
      const session = await ChatSession.findById(tx.usage.chatSessionId).select('title').lean();
      response.usage = { chatSessionId: tx.usage.chatSessionId, chatSessionTitle: session?.title || 'Untitled', models: tx.usage.models };
    }
    
    res.json(response);
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ error: 'Invalid ID', code: 'INVALID_TRANSACTION_ID' });
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to get transaction', code: 'GET_TRANSACTION_ERROR' });
  }
});

module.exports = router;
