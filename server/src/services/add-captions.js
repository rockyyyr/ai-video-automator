import * as Video from '../lib/Video.js';
import * as Baserow from '../lib/Baserow.js';

export default async function run(video) {
    console.log('Adding captions');

    const url = await Video.addCaptions(video['Video With Audio URL']);

    return Baserow.updateRow(Baserow.Tables.VIDEOS, video.id, {
        'Video With Captions URL': url,
        Step: 9
    });
}