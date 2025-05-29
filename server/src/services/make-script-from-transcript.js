import * as ScriptWriter from '../lib/ScriptWriter.js';
import * as Baserow from '../lib/Baserow.js';

export default async function run(video) {
    console.log('Writing script from transcript');

    const { title, description, script } = await ScriptWriter.scriptFromTranscript({
        transcript: video.Transcript,
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
