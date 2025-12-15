// LLM streaming - supports OpenAI and Gemini

const { OpenAI } = require('openai');
const { GoogleGenAI } = require('@google/genai');

let openAI = null;
let genAI = null;

const getOpenAI = () => openAI || (openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));
const getGenAI = () => genAI || (genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }));

async function streamFromModel(model, messages, callback) {
  if (model.startsWith('gpt')) {
    const stream = await getOpenAI().chat.completions.create({
      model,
      stream: true,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });
    for await (const chunk of stream) {
      const token = chunk.choices?.[0]?.delta?.content;
      if (token) callback(token);
    }
  } else if (model.startsWith('gemini')) {
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const stream = await getGenAI().models.generateContentStream({ model, contents });
    for await (const chunk of stream) {
      const parts = chunk?.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.text) callback(part.text);
      }
    }
  } else {
    throw new Error(`Unsupported model: ${model}`);
  }
}

module.exports = { streamFromModel };
