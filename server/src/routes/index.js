import express from 'express';
import * as Services from '../service-runner.js';
import * as Baserow from '../lib/Baserow.js';

const router = express.Router();

router.post('/video/generate', (req, res) => {
    Services.generateVideo(req.body);
    res.end();
});

router.post('/video/restart', (req, res) => {
    Services.restartVideo(req.body);
    res.end();
});

router.get('/video/in-progress', async (req, res) => {
    const videos = await Baserow.find(Baserow.Tables.VIDEOS, [
        {
            field: 'Step',
            value: 9,
            type: 'not_equal'
        }
    ], { orderBy: '-Timestamp' });

    const withScenes = await joinScenes(videos);
    res.json(withScenes);
});

router.get('/video/completed', async (req, res) => {
    const { page, pageSize } = req.query;
    const videos = await Baserow.find(Baserow.Tables.VIDEOS, [
        {
            field: 'Step',
            value: 9,
            type: 'equal'
        }
    ], { orderBy: '-Timestamp' });

    const withScenes = await joinScenes(videos);
    res.json(paginate(withScenes, page, pageSize));
});

router.delete('/video/:videoId', async (req, res) => {
    const videoId = req.params.videoId;
    await Baserow.deleteRow(Baserow.Tables.VIDEOS, videoId);
    res.end();
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
