import * as ImageGenerator from '../lib/ImageGenerator.js';
import * as Database from '../lib/Database.js';
import * as MinIO from '../lib/MinIO.js';

export default async function run(video, startTime) {
    console.log('Generating images');
    const start = startTime || Date.now();

    const scenes = await Database.find(Database.Tables.SCENES, [
        {
            field: 'Video ID',
            value: video.id
        },
        {
            field: 'Image Prompt',
            type: 'not_empty'
        },
        {
            field: 'Image URL',
            type: 'empty'
        }
    ]);

    let count = 0;

    await ImageGenerator.generateImages(scenes, async (scene, imageData) => {
        const url = await MinIO.saveFromBase64(`${Math.random()}-${video.uuid}-image-${scene['Segment #']}.jpeg`, imageData);

        await Database.updateRow(Database.Tables.SCENES, scene.id, {
            'Image URL': url
        });

        console.log(`Image complete: ${url}`);
        count++;
    });


    if (count === scenes.length) {
        console.log('Generating images complete:', `${Math.abs((Date.now() - start) / 1000)}s`);

        return Database.updateRow(Database.Tables.VIDEOS, video.id, {
            Step: 5
        });

    } else {
        return run(video, start);
    }

}