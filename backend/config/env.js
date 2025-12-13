// Environment config with validation

const requireEnv = (key) => {
  if (!process.env[key]) throw new Error(`Missing env: ${key}`);
  return process.env[key];
};

const optionalEnv = (key, fallback = null) => process.env[key] || fallback;

module.exports = {
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  PORT: parseInt(optionalEnv('PORT', '3000'), 10),
  
  MONGODB_URI: requireEnv('MONGODB_URI'),
  SESSION_SECRET: requireEnv('SESSION_SECRET'),
  
  OPENAI_API_KEY: requireEnv('OPENAI_API_KEY'),
  GEMINI_API_KEY: requireEnv('GEMINI_API_KEY'),
  
  SOLANA_RPC_URL: optionalEnv('SOLANA_RPC_URL', 'https://api.devnet.solana.com'),
  SOLANA_NETWORK: optionalEnv('SOLANA_NETWORK', 'devnet'),
  CREDITS_TOKEN_MINT: requireEnv('CREDITS_TOKEN_MINT'),
  BACKEND_WALLET_PRIVATE_KEY: requireEnv('BACKEND_WALLET_PRIVATE_KEY'),
  TREASURY_WALLET: requireEnv('TREASURY_WALLET'),
  
  GOOGLE_CLIENT_ID: optionalEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: optionalEnv('GOOGLE_CLIENT_SECRET'),
  GOOGLE_CALLBACK_URL: optionalEnv('GOOGLE_CALLBACK_URL', '/api/auth/google/callback'),
  
  FRONTEND_URL: optionalEnv('FRONTEND_URL', 'http://localhost:5173'),
};
