const { TTS_URL } = process.env;

import Axios from 'axios';

const api = Axios.create({
    baseURL: `${TTS_URL}/dev`,
});

export const Voices = {
    Female: {
        ALLOY: 'af_alloy',
        ECHO: 'af_echo',
        BELLA: 'af_bella',
        HEART: 'af_heart',
        JADZIA: 'af_jadzia',
        JESSICA: 'af_jessica',
        KORE: 'af_kore',
        NICOLE: 'af_nicole',
        NOVA: 'af_nova',
        RIVER: 'af_river',
        SARAH: 'af_sarah',
        SKY: 'af_sky',
    },
    Male: {
        ADAM: 'am_adam',
        ECHO: 'am_echo',
        ERIC: 'am_eric',
        FENRIR: 'am_fenrir',
        LIAM: 'am_liam',
        MICHAEL: 'am_michael',
        ONYX: 'am_onyx',
        PUCK: 'am_puck',
        SANTA: 'am_santa'
    }
};

export async function generateCaptionedSpeech(input, voice, speed = 1) {
    const response = await api.post('/captioned_speech', {
        model: "kokoro",
        input: formatInput(input),
        voice,
        response_format: "mp3",
        download_format: "mp3",
        speed,
        return_timestamps: true
    }, { responseType: 'stream' });

    const timestampFilepath = response.headers['x-timestamps-path'];
    const stream = response.data;

    return {
        timestampFilePath: timestampFilepath,
        stream
    };
}

function formatInput(input) {
    return input
        .replace(/\*|\/|\\/g, '')
        .replace(/\n/g, ' ')
        .replace(/&/g, 'and')
        .replace(/@/g, 'at')
        .trim();
}

export async function getCaptions(path) {
    const response = await api.get('/timestamps/' + path);
    return response.data;
}