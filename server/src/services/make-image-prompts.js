import * as ImagePrompter from '../lib/ImagePrompter.js';
import * as Database from '../lib/Database.js';

export default async function run(video) {
    console.log('Generating image prompts');
    const start = Date.now();

    const scenes = await Database.find(Database.Tables.SCENES, [
        {
            field: 'Video ID',
            value: video.id
        },
        {
            field: 'Image Prompt',
            type: 'empty'
        }
    ]);

    await ImagePrompter.generateImagePrompts(video.Script, scenes, video['Generative Style'], async (scene, prompt) => {
        await Database.updateRow(Database.Tables.SCENES, scene.id, {
            'Image Prompt': prompt
        });
        console.log(`Generated image prompt for scene ${scene['Segment #']}`);
    });

    console.log('Generating image prompts complete:', `${Math.abs((Date.now() - start) / 1000)}s`);

    return Database.updateRow(Database.Tables.VIDEOS, video.id, {
        Step: 4
    });
}
