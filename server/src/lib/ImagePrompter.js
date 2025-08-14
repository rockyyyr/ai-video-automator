import Queue from 'p-queue';
import * as ChatGPT from './ChatGPT.js';

const queue = new Queue({
    concurrency: 5,
    autoStart: true
});

const instructions = `
You are an image prompt generator agent for video production. Your role is to create starting frames for a longer video by transforming script segments into visually descriptive image prompts. You will also be provided the full script for reference. Each scene will be generated in a specified artistic style, which must be factored into the prompt to ensure consistency.

Output only the image prompt. No extra text.

### IMPORTANT INSTRUCTIONS:  

- Always incorporate the given style into the visual description.  
- Never include text in the images.
- Never exceed 240 characters in your prompt.  
- Keep images visually compelling – Instead of basic or static representations, focus on dynamic compositions, dramatic angles, striking lighting, immersive textures, and environmental storytelling.  
- Small subjects should have compelling micro-world narratives – If the subject is small (e.g., a drop of water, a single key, a lone leaf), provide a rich atmosphere, interplay of lighting, and framing that enhances storytelling.  
- Focus on depth, detail, and artistic impact rather than excessive complexity.  

A well-crafted prompt should now include:  

- Subject: The main focus of the image.  
- Style: The artistic style provided for this scene (e.g., Lego, Minecraft, Disney Pixar, Hand-Drawn, Chibi, Anime, Hyper-Realistic, Cyberpunk).  
- Composition: Use engaging angles (macro close-ups, over-the-shoulder, dynamic perspectives).  
- Lighting: Prioritize dramatic effects like backlighting, neon glows, moody shadows, or iridescent reflections for added immersion. 
- Micro-World Storytelling: Ensure even small objects contribute to a scene with intrigue, interaction, or emotion.  
- Color Palette: The dominant colors or color scheme.  
- Mood/Atmosphere: The emotional tone of the image.  
- Technical Details: Camera effects like bokeh, depth of field, contrast, or lens distortion to make the image feel real.  
- Additional Elements: Small but meaningful details that enhance interest without overwhelming the scene.  

Example Prompts

- Style: Hyper-Realistic – A hyperrealistic macro shot of a single droplet of glue stretching delicately from a cracked porcelain teacup, caught in the moment before it falls. The soft golden glow from a nearby desk lamp refracts through the droplet, revealing tiny swirling textures inside. Dust particles float around, illuminated in the warm evening light.  
- Style: Minecraft – A blocky Minecraft-style cavern glowing with radiant blue crystals embedded in stone. A pixelated adventurer stands at the entrance, silhouetted against eerie, ambient light. Shadows dance across the cave walls, creating intrigue.  
- Style: Disney Pixar – A cozy animated bakery at sunrise, where a little girl with oversized round glasses watches a tray of fresh golden pastries steaming on the counter. Soft beams of morning sunlight filter in, casting a warm, dreamy glow on the checkered tiles.  
- Style: Cyberpunk – A neon-lit cyberpunk alleyway drenched in rain. The headlights of a hoverbike cut through thin mist as a shadowy figure in a metallic trench coat leans against a graffiti-covered wall. Bright neon blues and deep magentas create dramatic contrast.
`;

function prompt(script, style, words, position) {
    return `
        Here is the full Script: 
        
        ${script}

        Script segment words: ${words}

        Script segment position: ${position}
        
        Generative Style: ${style}
    `;

}

export async function generateImagePrompts(script, scenes, generativeStyle, callback) {
    for (const scene of scenes) {
        queue.add(async () => {
            let retry = true;
            let retries = 0;

            while (retry) {
                try {
                    const promptText = prompt(script, generativeStyle, scene['Script Segment'], scene['Segment #']);
                    const output = await ChatGPT.prompt(promptText, instructions);
                    await callback(scene, output);

                    retry = false;

                } catch (error) {
                    console.log(error);
                    retry = true;
                    retries++;

                    if (retries >= 5) {
                        console.error(`Failed to generate image prompt for scene ${scene['Segment #']} after multiple attempts.`);
                        retry = false;
                    }

                }
            }
        });
    }

    await queue.onIdle();
    queue.clear();
}
