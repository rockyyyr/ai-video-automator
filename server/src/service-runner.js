import * as Baserow from './lib/Baserow.js';

import MakeScriptFromTopic from './services/make-script-from-topic.js';
import MakeScriptFromTranscript from './services/make-script-from-transcript.js';
import MakeSpeech from './services/make-speech.js';
import MakeScenes from './services/make-scenes.js';
import MakeImagePrompts from './services/make-image-prompts.js';
import MakeImages from './services/make-images.js';
import MakeClips from './services/make-clips.js';
import CombineClips from './services/combine-clips.js';
import AddAudio from './services/add-audio.js';
import AddCaptions from './services/add-captions.js';

export async function restartVideo({ videoId }) {
    const video = await Baserow.getRow(Baserow.Tables.VIDEOS, videoId);
    return runServices(video);
}

export async function generateVideo({ topic, transcript, duration, notes, generativeStyle, ttsVoice, ttsSpeed, sceneLength }) {
    const video = await Baserow.createRow(Baserow.Tables.VIDEOS, {
        Topic: topic,
        Transcript: transcript,
        Duration: parseFloat(duration),
        Notes: notes,
        'Scene Length': sceneLength,
        'Generative Style': generativeStyle,
        'TTS Voice': ttsVoice,
        'TTS Speed': ttsSpeed,
        'Timestamp': Date.now(),
        Step: 0
    });

    // return runServices(video);
}

async function runServices(videoData) {
    if (!videoData) {
        throw new Error('No video provided');
    }

    let video = { ...videoData };

    try {
        await Baserow.updateRow(Baserow.Tables.VIDEOS, video.id, {
            Error: false
        });

        const MakeScript = video.Topic ? MakeScriptFromTopic : MakeScriptFromTranscript;

        const services = [
            MakeScript,
            MakeSpeech,
            MakeScenes,
            MakeImagePrompts,
            MakeImages,
            MakeClips,
            CombineClips,
            AddAudio,
            AddCaptions
        ];

        const step = parseInt(video.Step) || 0;

        for (let i = step; i < services.length; i++) {
            const service = services[i];
            video = await service(video);
        }

        console.log('Video generation completed successfully:', video.Title);

    } catch (error) {

        await Baserow.updateRow(Baserow.Tables.VIDEOS, video.id, {
            Error: true
        });

        console.log(error);

        try {
            console.log(JSON.stringify(error, null, 4));
        } catch (_) {

        }

    }
}
