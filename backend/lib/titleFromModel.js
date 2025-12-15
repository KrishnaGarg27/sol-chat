// Generate chat titles from queries using GPT

const { OpenAI } = require('openai');

let openAI = null;
const getOpenAI = () => openAI || (openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));

async function titleFromModel(query) {
  if (!query) return 'New Chat';

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Generate a short 3-8 word title. Return only the title.' },
        { role: 'user', content: `Title for: "${query.slice(0, 500)}"` },
      ],
      temperature: 0.3,
      max_tokens: 20,
    });

    const title = response.choices[0]?.message?.content?.trim();
    if (!title || title.length < 2) return 'New Chat';
    return title.replace(/^["']|["']$/g, '').slice(0, 100);
  } catch (error) {
    console.error('Title generation failed:', error.message);
    return 'New Chat';
  }
}

module.exports = { titleFromModel };
