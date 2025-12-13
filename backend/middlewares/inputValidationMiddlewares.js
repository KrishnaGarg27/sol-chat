// Request body validation

const Joi = require('joi');

function validateInput(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message, code: 'VALIDATION_ERROR' });
    req.body = value;
    next();
  };
}

module.exports = { validateInput };
