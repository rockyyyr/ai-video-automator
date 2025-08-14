import * as ScriptWriter from '../lib/ScriptWriter.js';
import * as Database from '../lib/Database.js';

export default async function run(video) {
    console.log('Making scenes');
    const start = Date.now();

    const existingScenes = await Database.find(Database.Tables.SCENES, [
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
        return Database.updateRow(Database.Tables.VIDEOS, video.id, {
            Step: 3
        });
    }

    const scenes = ScriptWriter.chuckScriptIntoScenes(JSON.parse(video.Captions), video['Scene Length']);

    for (const scene of scenes.segments) {
        await Database.createRow(Database.Tables.SCENES, {
            'Video ID': video.id,
            'Segment #': scene.id,
            Duration: scene.duration,
            'Script Segment': scene.words
        });
    }

    console.log('Making scenes complete:', `${Math.abs((Date.now() - start) / 1000)}s`);

    return Database.updateRow(Database.Tables.VIDEOS, video.id, {
        '# of Scenes': scenes.segments.length,
        'Actual Duration': Math.ceil(scenes.totalDuration),
        Step: 3
    });
}
