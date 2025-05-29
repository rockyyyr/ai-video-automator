import * as ImageGenerator from '../lib/ImageGenerator.js';
import * as Baserow from '../lib/Baserow.js';
import * as MinIO from '../lib/MinIO.js';

export default async function run(video) {
    console.log('Generating images');

    const scenes = await Baserow.find(Baserow.Tables.SCENES, [
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

    await ImageGenerator.generateImages(scenes, async (scene, imageData) => {
        const url = await MinIO.saveFromBase64(`${video.uuid}-image-${scene['Segment #']}.jpeg`, imageData);

        await Baserow.updateRow(Baserow.Tables.SCENES, scene.id, {
            'Image URL': url
        });

        console.log(`Image complete: ${url}`);
    });

    return Baserow.updateRow(Baserow.Tables.VIDEOS, video.id, {
        Step: 5
    });
}