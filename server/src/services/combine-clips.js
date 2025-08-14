import * as Video from '../lib/Video.js';
import * as Database from '../lib/Database.js';

export default async function run(video) {
    console.log('Combining clips');
    const start = Date.now();

    const scenes = await Database.find(Database.Tables.SCENES, [
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

    console.log('Combining clips complete:', `${Math.abs((Date.now() - start) / 1000)}s`);

    return Database.updateRow(Database.Tables.VIDEOS, video.id, {
        'Video Combined Clips URL': videoUrl,
        Step: 7
    });
}
