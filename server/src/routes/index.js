import express from 'express';
import Queue from 'p-queue';
import * as Services from '../service-runner.js';
import * as Baserow from '../lib/Baserow.js';

const queue = new Queue({
    concurrency: 1,
    autoStart: true
});

const router = express.Router();

router.post('/video/generate', async (req, res) => {
    try {
        await Services.generateVideo(req.body, queue.add.bind(queue));
        res.end();

    } catch (error) {
        console.error('Error generating video:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/video/restart', (req, res) => {
    queue.add(() => Services.restartVideo(req.body), { priority: 0 });
    res.end();
});

router.get('/video/in-progress', async (req, res) => {
    try {
        const videos = await Baserow.find(Baserow.Tables.VIDEOS, [
            {
                field: 'Step',
                value: 9,
                type: 'not_equal'
            }
        ], { orderBy: '-Step,-Timestamp' });

        const withScenes = await joinScenes(videos);
        res.json(withScenes);

    } catch (error) {
        console.error('Error fetching in-progress videos:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/video/completed', async (req, res) => {
    const { page, pageSize } = req.query;
    try {
        const videos = await Baserow.find(Baserow.Tables.VIDEOS, [
            {
                field: 'Step',
                value: 9,
                type: 'equal'
            }
        ], { orderBy: '-Timestamp' });

        const withScenes = await joinScenes(videos);
        res.json(paginate(withScenes, page, pageSize));

    } catch (error) {
        console.error('Error fetching completed videos:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/video/:videoId', async (req, res) => {
    const videoId = req.params.videoId;
    try {
        await Baserow.deleteRow(Baserow.Tables.VIDEOS, videoId);

        const scenes = await Baserow.find(Baserow.Tables.SCENES, [
            {
                field: 'Video ID',
                value: videoId
            }
        ]);

        if (scenes.length) {
            const sceneIds = scenes.map(scene => scene.id);
            await Baserow.deleteBatch(Baserow.Tables.SCENES, sceneIds);
        }
        res.end();
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/image/delete', async (req, res) => {
    const { videoId, sceneId } = req.body;

    try {
        await Baserow.updateRow(Baserow.Tables.SCENES, sceneId, {
            'Image URL': null,
            'Image Prompt': null,
            'Clip URL': null
        });

        await Baserow.updateRow(Baserow.Tables.VIDEOS, videoId, {
            Step: 3,
            Error: true,
            'Video Combined Clips URL': null,
            'Video With Audio URL': null,
            'Video With Captions URL': null
        });

        res.end();

    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/settings/caption-profiles', async (req, res) => {
    try {
        const profiles = await Baserow.find(Baserow.Tables.CAPTION_PROFILES, [], { orderBy: 'profileName' });
        res.json(profiles);

    } catch (error) {
        console.error('Error fetching caption profiles:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/settings/caption-profiles', async (req, res) => {
    try {
        const profile = await Baserow.createRow(Baserow.Tables.CAPTION_PROFILES, req.body);
        res.json(profile);
    } catch (error) {
        console.error('Error creating caption profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/settings/caption-profiles/:id', async (req, res) => {
    const profileId = req.params.id;
    try {
        const profile = await Baserow.updateRow(Baserow.Tables.CAPTION_PROFILES, profileId, req.body);
        res.json(profile);

    } catch (error) {
        console.error('Error updating caption profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

function paginate(array, page, pageSize) {
    return array.slice((page - 1) * pageSize, page * pageSize);
}

async function joinScenes(videos) {
    for (const video of videos) {
        video.scenes = await Baserow.find(Baserow.Tables.SCENES, [
            {
                field: 'Video ID',
                value: video.id
            }
        ]);
    }
    return videos;
}

export default router;
