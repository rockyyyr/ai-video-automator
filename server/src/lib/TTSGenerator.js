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
        // .replace(/\n/g, ' ')
        .replace(/&/g, 'and')
        .replace(/@/g, 'at')
        .trim();
}

export async function getCaptions(path) {
    const response = await api.get('/timestamps/' + path);
    return response.data;
}

/**
 * Convert a time in seconds (float) to SRT timestamp format "HH:MM:SS,mmm".
 * @param {number} seconds
 * @returns {string} e.g. "00:00:01,234"
 */
function secondsToSrtTimestamp(seconds) {
    const totalMillis = Math.floor(seconds * 1000);
    const hours = Math.floor(totalMillis / 3_600_000);
    const minutes = Math.floor((totalMillis % 3_600_000) / 60_000);
    const secs = Math.floor((totalMillis % 60_000) / 1000);
    const millis = totalMillis % 1000;

    const HH = String(hours).padStart(2, '0');
    const MM = String(minutes).padStart(2, '0');
    const SS = String(secs).padStart(2, '0');
    const mmm = String(millis).padStart(3, '0');

    return `${HH}:${MM}:${SS},${mmm}`;
}

/**
 * Read a JSON file of word‐level timestamps and write an SRT file
 * where each word is its own subtitle entry.
 *
 * @param {string} inputJsonPath  - path to the JSON file
 * @param {string} outputSrtPath  - desired path for the .srt output
 */
export function captionsToSRT(captions) {
    try {

        let srtContent = '';

        for (let i = 0; i < captions.length; i++) {
            const idx = i + 1;
            const { word = '', start_time = 0, end_time = 0 } = captions[i];
            const text = word.trim();

            const startTs = secondsToSrtTimestamp(start_time);
            const endTs = secondsToSrtTimestamp(end_time);

            srtContent += `${idx}\n`;
            srtContent += `${startTs} --> ${endTs}\n`;
            srtContent += `${text}\n\n`;
        }

        return srtContent;

    } catch (err) {
        console.error('Error converting JSON to SRT:', err);
    }
}