import * as ScriptWriter from '../lib/ScriptWriter.js';
import * as Baserow from '../lib/Baserow.js';

export default async function run(video) {
    console.log('Writing script from topic:', video.Topic);

    const { title, description, script } = await ScriptWriter.scriptFromTopic({
        topic: video.Topic,
        duration: video.Duration,
        notes: video.Notes
    });

    return Baserow.updateRow(Baserow.Tables.VIDEOS, video.id, {
        Title: title,
        Description: description,
        Script: script,
        Step: 1
    });
}
