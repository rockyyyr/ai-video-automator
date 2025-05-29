import * as ScriptWriter from '../lib/ScriptWriter.js';
import * as Baserow from '../lib/Baserow.js';

export default async function run(video) {
    console.log('Making scenes');

    const scenes = ScriptWriter.chuckScriptIntoScenes(JSON.parse(video.Captions), video['Scene Length']);

    for (const scene of scenes.segments) {
        await Baserow.createRow(Baserow.Tables.SCENES, {
            'Video ID': video.id,
            'Segment #': parseInt(scene.id),
            Duration: parseFloat(scene.duration),
            'Script Segment': scene.words
        });
    }

    return Baserow.updateRow(Baserow.Tables.VIDEOS, video.id, {
        '# of Scenes': scenes.segments.length,
        'Actual Duration': scenes.totalDuration,
        Step: 3
    });
}
