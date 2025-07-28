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

export async function generateVideo({ topic, transcript, duration, script, notes, generativeStyle, ttsVoice, ttsSpeed, sceneLength, captionProfile }, queue) {
    const video = await Baserow.createRow(Baserow.Tables.VIDEOS, {
        Topic: topic,
        Transcript: transcript,
        Duration: parseFloat(duration),
        Notes: notes,
        Script: script,
        'Scene Length': sceneLength,
        'Generative Style': generativeStyle,
        'TTS Voice': ttsVoice,
        'TTS Speed': ttsSpeed,
        'Timestamp': Date.now(),
        captionProfile: parseInt(captionProfile),
        Step: script ? 1 : 0,
    });

    queue(() => runServices(video));
    return;
}

async function runServices(videoData) {
    if (!videoData) {
        console.error(new Error('No video data provided'));
        return;
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

async function testQueue(video) {
    const delays = [3000, 3000, 3000, 3000, 4000, 5000, 6000, 6000, 6000];

    for (const i in delays) {
        await wait(delays[i]);
        console.log(`Video ${video.id} step ${parseInt(i) + 1} complete`);

        await Baserow.updateRow(Baserow.Tables.VIDEOS, video.id, {
            Step: parseInt(i) + 1
        });
    }
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}