import * as Video from '../lib/Video.js';
import * as Database from '../lib/Database.js';

export default async function run(video) {
    console.log('Adding audio');
    const start = Date.now();

    const url = await Video.compose({
        videoUrl: video['Video Combined Clips URL'],
        audioUrl: video['TTS URL'],
    });

    console.log('Adding audio complete:', `${Math.abs((Date.now() - start) / 1000)}s`);

    return Database.updateRow(Database.Tables.VIDEOS, video.id, {
        'Video With Audio URL': url,
        Step: 8
    });
}
