import * as Video from '../lib/Video.js';
import * as Baserow from '../lib/Baserow.js';

export default async function run(video) {
    console.log('Adding audio');

    const url = await Video.compose({
        videoUrl: video['Video Combined Clips URL'],
        audioUrl: video['TTS URL'],
    });

    return Baserow.updateRow(Baserow.Tables.VIDEOS, video.id, {
        'Video With Audio URL': url,
        Step: 8
    });
}
