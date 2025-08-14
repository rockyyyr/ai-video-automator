import * as ScriptWriter from '../lib/ScriptWriter.js';
import * as Database from '../lib/Database.js';

export default async function run(video) {
    console.log('Writing script from topic:', video.Topic);
    const start = Date.now();

    const { title, description, script } = await ScriptWriter.scriptFromTopic({
        topic: video.Topic,
        duration: video.Duration,
        notes: video.Notes
    });

    console.log('Writing script from topic complete:', `${Math.abs((Date.now() - start) / 1000)}s`);

    return Database.updateRow(Database.Tables.VIDEOS, video.id, {
        Title: title,
        Description: description,
        Script: script,
        Step: 1
    });
}
