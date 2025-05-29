import * as ImagePrompter from '../lib/ImagePrompter.js';
import * as Baserow from '../lib/Baserow.js';

export default async function run(video) {
    console.log('Generating image prompts');

    const scenes = await Baserow.find(Baserow.Tables.SCENES, [
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
        await Baserow.updateRow(Baserow.Tables.SCENES, scene.id, {
            'Image Prompt': prompt
        });
        console.log(`Generated image prompt for scene ${scene['Segment #']}`);
    });

    return Baserow.updateRow(Baserow.Tables.VIDEOS, video.id, {
        Step: 4
    });
}
