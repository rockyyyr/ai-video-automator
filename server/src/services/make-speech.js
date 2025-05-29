import * as TTSGenerator from '../lib/TTSGenerator.js';
import * as MinIO from '../lib/MinIO.js';
import * as Baserow from '../lib/Baserow.js';

export default async function run(video) {
    console.log('Generating speech');

    const speech = await TTSGenerator.generateCaptionedSpeech(video.Script, video['TTS Voice']);
    const captions = await TTSGenerator.getCaptions(speech.timestampFilePath);

    const speechUrl = await MinIO.saveFromStream(`${video.uuid}-speech.mp3`, speech.stream);

    return Baserow.updateRow(Baserow.Tables.VIDEOS, video.id, {
        'TTS URL': speechUrl,
        Captions: JSON.stringify(captions),
        Step: 2
    });
}
