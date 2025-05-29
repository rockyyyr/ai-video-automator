import * as Video from '../lib/Video.js';
import * as Baserow from '../lib/Baserow.js';

export default async function run(video) {
    console.log('Generating clips from images');

    const scenes = await Baserow.find(Baserow.Tables.SCENES, [
        {
            field: 'Video ID',
            value: video.id
        },
        {
            field: 'Image URL',
            type: 'not_empty'
        }
    ]);

    await Video.clipsFromImages(scenes, async (scene, clipURL) => {
        await Baserow.updateRow(Baserow.Tables.SCENES, scene.id, {
            'Clip URL': clipURL
        });

        console.log(`Scene ${scene['Segment #']} clip created: ${clipURL}`);
    });

    return Baserow.updateRow(Baserow.Tables.VIDEOS, video.id, {
        Step: 6
    });
}
