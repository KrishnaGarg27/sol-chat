const { OpenAI } = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function streamFromModel(model, query, callback) {
  const stream = await client.responses.create({
    model: "gpt-5.1",
    stream: true,
    messages: query,
  });
}

module.exports = streamFromModel;
