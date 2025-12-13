// Chat validation middlewares

const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');

async function chatSessionValid(req, res, next) {
  const { chatSessionId } = req.params;
  if (!chatSessionId) {
    return res.status(400).json({ error: 'Chat session ID required', code: 'MISSING_SESSION_ID' });
  }
  
  try {
    const chatSession = await ChatSession.findById(chatSessionId);
    if (!chatSession) {
      return res.status(404).json({ error: 'Chat session not found', code: 'SESSION_NOT_FOUND' });
    }
    
    // Check ownership
    if (chatSession.userId && req.session?.userId !== chatSession.userId.toString()) {
      return res.status(403).json({ error: 'Access denied', code: 'ACCESS_DENIED' });
    }
    
    req.chatSession = chatSession;
    next();
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid session ID', code: 'INVALID_SESSION_ID' });
    }
    console.error('Session validation error:', error);
    res.status(500).json({ error: 'Validation failed', code: 'VALIDATION_ERROR' });
  }
}

async function queryMessageValid(req, res, next) {
  const { queryId } = req.params;
  if (!queryId) {
    return res.status(400).json({ error: 'Query ID required', code: 'MISSING_QUERY_ID' });
  }
  
  try {
    const queryMessage = await ChatMessage.findById(queryId);
    if (!queryMessage || queryMessage.role !== 'user') {
      return res.status(404).json({ error: 'Query not found', code: 'QUERY_NOT_FOUND' });
    }
    
    const chatSession = await ChatSession.findById(queryMessage.chatSessionId);
    if (!chatSession) {
      return res.status(404).json({ error: 'Chat session not found', code: 'SESSION_NOT_FOUND' });
    }
    
    // Check ownership
    if (chatSession.userId && req.session?.userId !== chatSession.userId.toString()) {
      return res.status(403).json({ error: 'Access denied', code: 'ACCESS_DENIED' });
    }
    
    req.queryMessage = queryMessage;
    req.chatSession = chatSession;
    next();
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid query ID', code: 'INVALID_QUERY_ID' });
    }
    console.error('Query validation error:', error);
    res.status(500).json({ error: 'Validation failed', code: 'VALIDATION_ERROR' });
  }
}

module.exports = { chatSessionValid, queryMessageValid };
