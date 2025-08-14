import * as Video from '../lib/Video.js';
import * as Database from '../lib/Database.js';

export default async function run(video) {
    console.log('Adding captions');
    const start = Date.now();

    let captionProfile;

    try {
        captionProfile = await Database.getRow(Database.Tables.CAPTION_PROFILES, video.captionProfile);

    } catch (error) {
        console.log('Error fetching caption profile. Using default');
    }

    const settings = captionProfile?.settings && JSON.parse(captionProfile.settings);

    const url = await Video.addCaptions(video['Video With Audio URL'], settings, video['Replace Words']);

    console.log('Adding captions complete:', `${Math.abs((Date.now() - start) / 1000)}s`);

    return Database.updateRow(Database.Tables.VIDEOS, video.id, {
        'Video With Captions URL': url,
        Step: 9
    });
}
