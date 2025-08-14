import Together from 'together-ai';
import Queue from 'p-queue';
import Keys from '../../togetherai-keys.js';

const clients = Keys.map(apiKey => new Together({ apiKey }));
let key = 0;

const queue = new Queue({
    concurrency: Keys.length,
    autoStart: true
});

async function generateImage(scene) {
    const response = await clients[key++ % Keys.length].images.create({
        model: "black-forest-labs/FLUX.1-schnell-Free",
        prompt: scene['Image Prompt'],
        width: 576,
        height: 1024,
        steps: 4,
        n: 1,
        response_format: "base64"
    });

    return response.data[0].b64_json;
}

export async function generateImages(scenes, callback) {
    for (const scene of scenes) {
        queue.add(async () => {
            let retry = true;
            let retries = 0;

            while (retry) {
                try {
                    const response = await generateImage(scene);
                    await callback(scene, response);

                    retry = false;

                } catch (error) {
                    console.log(error);
                    retry = true;
                    retries++;

                    if (retries >= 5) {
                        console.error(`Failed to generate image for scene ${scene['Segment #']} after multiple attempts.`);
                        retry = false;
                    }
                }
            }
        });
    }
    await queue.onIdle();
    queue.clear();
}
