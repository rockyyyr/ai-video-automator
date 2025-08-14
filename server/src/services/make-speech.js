import * as TTSGenerator from '../lib/TTSGenerator.js';
import * as MinIO from '../lib/MinIO.js';
import * as Database from '../lib/Database.js';

export default async function run(video) {
    console.log('Generating speech');
    const start = Date.now();

    const speech = await TTSGenerator.generateCaptionedSpeech(video.Script, video['TTS Voice'], video['TTS Speed']);
    const captions = await TTSGenerator.getCaptions(speech.timestampFilePath);
    const srt = TTSGenerator.captionsToSRT(captions);

    const speechUrl = await MinIO.saveFromStream(`${video.uuid}-speech.mp3`, speech.stream);
    const srtUrl = await MinIO.save(`${video.uuid}-captions.srt`, srt);

    console.log('Generating speech complete:', `${Math.abs((Date.now() - start) / 1000)}s`);

    return Database.updateRow(Database.Tables.VIDEOS, video.id, {
        'TTS URL': speechUrl,
        'SRT URL': srtUrl,
        Captions: JSON.stringify(captions),
        Step: 2
    });
}
