const { DEEPGRAM_API_KEY } = process.env;
import Axios from 'axios';

const api = Axios.create({
    baseURL: 'https://api.deepgram.com/v1',
    headers: {
        Authorization: DEEPGRAM_API_KEY,
        'Content-Type': 'application/json'
    }
});

export async function generateCaptionedSpeech(input, voice, speed = 1) {
    const response = await api.post('/speak?=model?', { responseType: 'stream' });

    const timestampFilepath = response.headers['x-timestamps-path'];
    const stream = response.data;

    return {
        timestampFilePath: timestampFilepath,
        stream
    };
}
