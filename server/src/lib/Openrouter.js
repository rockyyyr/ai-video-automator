import Axios from 'axios';
import Keys from '../../openrouter-keys.js';

const model = 'deepseek/deepseek-chat-v3-0324:free';
let key = 0;

const api = Axios.create({
    baseURL: 'https://openrouter.ai/api/v1'
});

api.interceptors.response.use(
    (response) => response.data,
    error => Promise.reject(error)
);

function headers() {
    return {
        headers: {
            Authorization: `Bearer ${Keys[key++ % Keys.length]}`
        }
    };
}

export async function createPrompt(prompt) {
    let attempt = 1;

    while (attempt) {
        const response = await api.post('/completions', {
            model,
            prompt
        }, headers());

        if (response.choices && response.choices.length > 0 && response.choices[0].text) {
            return response.choices[0].text;
        }

        if (++attempt > 5) {
            throw new Error('Failed to get a valid response after multiple attempts');
        }
    }
}
