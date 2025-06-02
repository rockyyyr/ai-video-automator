import * as Video from '../lib/Video.js';
import * as Baserow from '../lib/Baserow.js';

export default async function run(video) {
    console.log('Adding captions');

    let captionProfile;

    try {
        captionProfile = await Baserow.getRow(Baserow.Tables.CAPTION_PROFILES, video.captionProfile);

    } catch (error) {
        console.log('Error fetching caption profile. Using default');
    }

    const settings = captionProfile?.settings && JSON.parse(captionProfile.settings);

    const url = await Video.addCaptions(video['Video With Audio URL'], settings);

    return Baserow.updateRow(Baserow.Tables.VIDEOS, video.id, {
        'Video With Captions URL': url,
        Step: 9
    });
}
