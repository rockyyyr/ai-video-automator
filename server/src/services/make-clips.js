import * as Video from '../lib/Video.js';
import * as Database from '../lib/Database.js';

export default async function run(video) {
    console.log('Generating clips from images');
    const start = Date.now();

    const scenes = await Database.find(Database.Tables.SCENES, [
        {
            field: 'Video ID',
            value: video.id
        },
        {
            field: 'Image URL',
            type: 'not_empty'
        },
        {
            field: 'Clip URL',
            type: 'empty'
        }
    ]);

    await Video.clipsFromImages(scenes, async (scene, clipURL) => {
        await Database.updateRow(Database.Tables.SCENES, scene.id, {
            'Clip URL': clipURL
        });

        console.log(`Scene ${scene['Segment #']} clip created: ${clipURL}`);
    });

    console.log('Generating clips from images complete:', `${Math.abs((Date.now() - start) / 1000)}s`);

    return Database.updateRow(Database.Tables.VIDEOS, video.id, {
        Step: 6
    });
}
