import express from 'express';
import Queue from 'p-queue';
import * as Services from '../service-runner.js';
import * as Database from '../lib/Database.js';
import * as Minio from '../lib/MinIO.js';

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

router.patch('/video/:id', async (req, res) => {
    const videoId = req.params.id;

    try {
        const updatedVideo = await Database.updateRow(Database.Tables.VIDEOS, videoId, req.body);
        res.json(updatedVideo);

    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/video/in-progress', async (req, res) => {
    try {
        const result = await Database.videosWithScenes([
            {
                field: 'Step',
                value: 9,
                type: 'not_equal'
            }
        ]);

        res.json(result);

    } catch (error) {
        console.error('Error fetching in-progress videos:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/video/completed', async (req, res) => {
    const { page, pageSize } = req.query;
    try {
        const result = await Database.videosWithScenes([
            {
                field: 'Step',
                value: 9
            }
        ], { page, pageSize });

        res.json(result);

    } catch (error) {
        console.error('Error fetching completed videos:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/video/:videoId', async (req, res) => {
    const videoId = req.params.videoId;
    try {
        const videoWithScenes = await Database.videosWithScenes([{ field: 'v.id', value: videoId }], { first: true });

        let objectList = videoWithScenes.scenes.reduce((list, scene) => {
            list.push(scene['Image URL'], scene['Clip URL']);
            return list;
        }, []);

        objectList.push(
            videoWithScenes['SRT URL'],
            videoWithScenes['TTS URL'],
            videoWithScenes['Video Combined Clips URL'],
            videoWithScenes['Video With Audio URL'],
            videoWithScenes['Video With Captions URL']
        );

        objectList = objectList
            .filter(url => url)
            .map(url => url.split('/').pop());

        await Database.deleteRow(Database.Tables.VIDEOS, videoId);
        await Minio.removeBatch(objectList);

        res.end();

    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/image/prompt/:sceneId', async (req, res) => {
    const sceneId = req.params.sceneId;
    const { prompt, videoId } = req.body;

    try {
        await Database.updateRow(Database.Tables.SCENES, sceneId, {
            'Image Prompt': prompt,
            'Image URL': null,
            'Clip URL': null
        });

        await Database.updateRow(Database.Tables.VIDEOS, videoId, {
            Step: 3,
            Error: true,
            'Video Combined Clips URL': null,
            'Video With Audio URL': null,
            'Video With Captions URL': null
        });

        res.end();

    } catch (error) {
        console.error('Error updating image prompt:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/image/all', async (req, res) => {
    try {
        const scenes = await Database.find(Database.Tables.SCENES, [
            {
                field: 'Image URL',
                type: 'not_empty'
            }
        ], { returning: 'Image URL' });
        res.json(scenes);

    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/image/delete', async (req, res) => {
    const { videoId, sceneId } = req.body;

    try {
        await Database.updateRow(Database.Tables.SCENES, sceneId, {
            'Image URL': null,
            'Image Prompt': null,
            'Clip URL': null
        });

        await Database.updateRow(Database.Tables.VIDEOS, videoId, {
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
        const profiles = await Database.find(Database.Tables.CAPTION_PROFILES, [], { orderBy: 'profileName' });
        res.json(profiles);

    } catch (error) {
        console.error('Error fetching caption profiles:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/settings/caption-profiles', async (req, res) => {
    try {
        const profile = await Database.createRow(Database.Tables.CAPTION_PROFILES, req.body);
        res.json(profile);
    } catch (error) {
        console.error('Error creating caption profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/settings/caption-profiles/:id', async (req, res) => {
    const profileId = req.params.id;
    try {
        const profile = await Database.updateRow(Database.Tables.CAPTION_PROFILES, profileId, req.body);
        res.json(profile);

    } catch (error) {
        console.error('Error updating caption profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
