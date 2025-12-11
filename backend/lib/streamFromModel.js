const { OpenAI } = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function streamFromModel(model, messages, callback) {
  const stream = await client.chat.completions.create({
    model,
    stream: true,
    messages,
  });

  for await (chunk of stream) {
    const token = chunk.choices?.[0]?.delta?.content;
    if (token) {
      callback(token);
    }
  }
}

module.exports.streamFromModel = streamFromModel;
