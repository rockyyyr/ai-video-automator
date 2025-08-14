import * as ScriptWriter from '../lib/ScriptWriter.js';
import * as Database from '../lib/Database.js';

export default async function run(video) {
    console.log('Writing script from transcript');
    const start = Date.now();

    const { title, description, script } = await ScriptWriter.scriptFromTranscript({
        transcript: video.Transcript,
        duration: video.Duration,
        notes: video.Notes
    });

    console.log('Writing script from transcript complete:', `${Math.abs((Date.now() - start) / 1000)}s`);

    return Database.updateRow(Database.Tables.VIDEOS, video.id, {
        Title: title,
        Description: description,
        Script: script,
        Step: 1
    });
}
