import * as Video from '../lib/Video.js';
import * as Baserow from '../lib/Baserow.js';

export default async function run(video) {
    console.log('Combining clips');

    const scenes = await Baserow.find(Baserow.Tables.SCENES, [
        {
            field: 'Video ID',
            value: video.id,
        },
        {
            field: 'Clip URL',
            type: 'not_empty'
        }
    ]);

    if (scenes.length < video['# of Scenes']) {
        throw new Error('Not all scenes were created successfully.');
    }

    const videoUrl = await Video.combineClips(scenes, video.uuid);

    return Baserow.updateRow(Baserow.Tables.VIDEOS, video.id, {
        'Video Combined Clips URL': videoUrl,
        Step: 7
    });
}
