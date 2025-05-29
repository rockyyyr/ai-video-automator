const { NCATOOLKIT_URL, NCATOOLKIT_API_KEY } = process.env;
import Axios from 'axios';

const api = Axios.create({
    baseURL: `${NCATOOLKIT_URL}/v1`,
    headers: {
        'X-API-Key': NCATOOLKIT_API_KEY
    }
});

api.interceptors.response.use(
    (response) => response.data,
    error => Promise.reject(error)
);

export async function clipsFromImages(scenes, callback) {
    for (const scene of scenes) {
        const result = await api.post('/image/convert/video', {
            image_url: scene['Image URL'],
            length: parseFloat(scene.Duration),
            frame_rate: 25,
            zoom_speed: 3,
            id: `${scene.uuid}-${scene.id}`,
        });

        if (!result || result.message !== 'success') {
            throw new Error('Error generating clip:\n' + result.message);
        }

        const clipUrl = result.response;
        await callback(scene, clipUrl);
    }
}

export async function combineClips(scenes, rowId) {
    const videoPaths = scenes.map(scene => ({ video_url: scene['Clip URL'] }));

    const result = await api.post('/video/concatenate', {
        video_urls: videoPaths,
        id: `${rowId}-combined-clips`
    });

    if (!result || result.message !== 'success') {
        throw new Error('Error merging clips:\n' + result.message);
    }

    return result.response;
}

export async function compose({ videoUrl, audioUrl }) {
    const result = await api.post('/ffmpeg/compose', {
        id: "audio-layering",
        inputs: [
            { file_url: videoUrl },
            { file_url: audioUrl }
        ],
        filters: [{
            filter: "[1:a]volume=1[outa]"
        }],
        outputs: [
            {
                options: [
                    {
                        "option": "-map",
                        "argument": "0:v"
                    },
                    {
                        "option": "-map",
                        "argument": "[outa]"
                    },
                    {
                        "option": "-c:v",
                        "argument": "copy"
                    },
                    {
                        "option": "-c:a",
                        "argument": "aac"
                    }
                ]
            }
        ]
    });

    if (!result || result.message !== 'success') {
        throw new Error('Error composing video:\n' + result.message);
    }

    return result?.response && result.response[0]?.file_url;
}

export async function addCaptions(videoUrl) {
    const result = await api.post('/video/caption', {
        video_url: videoUrl,
        settings: {
            line_color: "#FFFFFF",
            word_color: "#22b525",
            all_caps: true,
            max_words_per_line: 3,
            font_size: 80,
            bold: false,
            italic: false,
            underline: false,
            strikeout: false,
            outline_width: 6,
            shadow_offset: 8,
            style: "highlight",
            font_family: "The Bold Font",
            position: "top_center",
        },
        language: 'en',
        id: '/captioned-video'
    });

    if (!result || result.message !== 'success') {
        throw new Error('Error composing video:\n' + result.message);
    }

    return result.response;
}

export async function addBackgroundMusic(videoUrl) {

}
