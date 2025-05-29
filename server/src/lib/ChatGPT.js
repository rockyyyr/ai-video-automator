import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.CHATGPT_API_KEY,
});

export async function prompt(prompt, instructions) {
    const input = {
        model: 'gpt-4.1',
        input: prompt
    };

    if (instructions) {
        input.instructions = instructions;
    }

    const response = await openai.responses.create(input);

    if (!response || response.error) {
        throw new Error('Error generating response:\n' + response.error.message);
    }

    return response.output_text;
}
