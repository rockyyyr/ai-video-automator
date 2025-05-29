import Together from 'together-ai';

const together = new Together({
    apiKey: process.env.TOGETHER_API_KEY
});

export async function generateImages(scenes, callback) {
    for (const scene of scenes) {
        let retry = true;
        let retries = 0;

        while (retry) {
            try {
                const response = await together.images.create({
                    model: "black-forest-labs/FLUX.1-schnell-Free",
                    prompt: scene['Image Prompt'],
                    width: 576,
                    height: 1024,
                    steps: 4,
                    n: 1,
                    response_format: "base64"
                });

                await callback(scene, response.data[0].b64_json);
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
    }
}
