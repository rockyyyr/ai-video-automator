import * as ScriptWriter from '../lib/ScriptWriter.js';
import * as Baserow from '../lib/Baserow.js';

export default async function run(video) {
    console.log('Making scenes');

    const existingScenes = await Baserow.find(Baserow.Tables.SCENES, [
        {
            field: 'Video ID',
            value: video.id
        },
        {
            field: 'Segment #',
            type: 'not_empty'
        },
        {
            field: 'Script Segment',
            type: 'not_empty'
        },
        {
            field: 'Duration',
            type: 'not_empty'
        }
    ]);

    if (existingScenes?.length > 0) {
        return Baserow.updateRow(Baserow.Tables.VIDEOS, video.id, {
            Step: 3
        });
    }

    const scenes = ScriptWriter.chuckScriptIntoScenes(JSON.parse(video.Captions), video['Scene Length']);

    for (const scene of scenes.segments) {
        await Baserow.createRow(Baserow.Tables.SCENES, {
            'Video ID': video.id,
            'Segment #': scene.id,
            Duration: scene.duration,
            'Script Segment': scene.words
        });
    }

    return Baserow.updateRow(Baserow.Tables.VIDEOS, video.id, {
        '# of Scenes': scenes.segments.length,
        'Actual Duration': Math.ceil(scenes.totalDuration),
        Step: 3
    });
}
