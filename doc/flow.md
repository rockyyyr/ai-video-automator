# AI Video Automation Flow

## Create Script

1. Get Script Idea
    - Topic
    - Duration
    - Generative Style
    - TTS Voice
2. Prompt ai to make the script. Output format will be:
    - Title
    - Description
    - Hook
    - Main Script
    - Call-to-action

### `Input Prompt`

```
Instructions:

Act as a YouTube video scriptwriter who specializes in transforming user-submitted ideas—whether they are story concepts or intriguing facts—into engaging, bite-sized video scripts. The user will also provide a target video length, which you should keep in mind while crafting the content. Your goal is to take these ideas and produce compelling, original content without referencing specific sources or names.

Your script should be engaging, energetic, and easy to follow, turning user concepts into captivating narratives within the specified video length. Use a conversational tone, vivid descriptions, and a strong hook to instantly grab attention. Keep the pacing snappy, ensuring that every second counts.

NEVER add linebreaks or emojis to the hook, main script & CTA

Output Format:
- Title: [Catchy, curiosity-driven title based on user idea]  
- Description: [50-150 characters, snappy summary with key hashtags relevant to the user’s topic]  
- Hook: [An attention-grabbing opening line inspired by the user idea]  
- MainScript: [A natural, spoken-style script without line breaks or emojis, tailored to the user-defined video length]  
- Call to Action: [A compelling prompt encouraging viewers to engage, like "What was your favorite part of this story?" or "Want to explore more ideas? Follow for more!"]

Make sure the MainScript feels seamless and original, as if these insights are being shared firsthand. No direct references to names, specific sources, or the user—just pure, engaging storytelling that keeps viewers hooked.

User Input:

Topic: <user supplied topic>
Rough Duration: <user supplied duration>
```

### `Expected Output`

```
Title: The Shocking Truth About Eating Live Rats


Description: Why would anyone eat live rats? The disturbing reality behind this extreme survival tactic. #Survival #ExtremeFood #ShockingFacts


Hook: Imagine being so desperate for food that you'd eat a live rat—this is the horrifying reality for some.


MainScript: In extreme poverty, survival means making unthinkable choices. Some people, with no other options, resort to eating live rats—raw and squirming. It’s not for shock value; it’s pure desperation. Rats are quick to catch, require no cooking, and provide protein, but the risks are huge. Diseases like leptospirosis and rat-bite fever lurk in every bite. Yet, when starvation looms, even this becomes a last resort.


Call to Action: Would you ever consider eating something this extreme to survive? Drop your thoughts below.

```

3. Combine Hook, MainScript, Call-to-action as "Script"
4. Save Data to Baserow Video Table
    - Topic
    - Title
    - Description
    - Duration
    - Generative Style
    - TTS Voice
    - Script
    - Status: `Processing`

```
```


## Generate TTS

1. From Baserow `VideoTable`, pull record
2. Generate TTS

```json
    POST "http://host.docker.internal:8880/dev/captioned_speech"

    {
        "model": "kokoro",
        "input": "<Script from baserow>",
        "voice": "<TTS Voice from baserow>",
        "response_format": "mp3",
        "download_format": "mp3",
        "speed": 1,
        "return_timestamps": true
    }
```


3. Received downloaded audio and record `x-timestamps-path` from response header.
4. Download captions file

```json
    GET "http://host.docker.internal:8880/dev/timestamps/<x-timestamps-path>"
```

5. Save audio file to Baserow media. Record URL to `VideoTable."TTS Audio URL"`
6. Save captions file to Baserow media. Record URL to `VideoTable."Captions URL"`
```
```


# Generate Scenes

1. From Baserow, fetch Captions file

```json
    GET "http://host.docker.internal:85/media/user_files/<VideoTable.Captions_URL>"
```
2. Split captions file into 5 second segments (see `./js/split-captions-to-5-seconds.js`)

### Output: 
```json
    {
        "segments": [
            {
                "json": {
                    "id": 0, //incrementing
                    "words": "approx 5 seconds worth of captions",
                    "duration": "<actual duration of segment>"
                }
            }
        ],
        "totalDuration": 39, //<duration seconds>
        "totalMinutes": "0 minutes, 39 seconds"
    }
```

3. Check to see if any segments are less than 2 seconds. Combine with the previous segment if true. (see `./js/combine-short-segment.js`)
4. For each segment, use ai to create an image generation prompt

### `Input Prompt`
```
System: You are an image prompt generator agent for video production. Your role is to create starting frames for a longer video by transforming script segments into visually descriptive image prompts. Each scene will be generated in a specified artistic style, which must be factored into the prompt to ensure consistency.

Output a JSON object containing the prompt for the current script segment that you are presented with:

{
    "Prompt": "enter prompt here"
}

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


Human: 

Heres the full script:
Ever wondered how to ensure your JSON data is structured correctly? JSON Schema is the answer! JSON Schema is a powerful tool for validating and annotating JSON documents. It allows you to define the structure, data types, and constraints of your JSON data, ensuring consistency and correctness. Whether you're working with APIs, configuration files, or data storage, mastering JSON Schema can save you time and prevent errors. Start using JSON Schema today and take your JSON validation to the next level!

Generative style:
Lego

Here is the current scene:
Script portion: Ever wondered how to ensure your JSON data is structured correctly ? JSON
Script position: 0

### Important:

You must format your output as a JSON value that adheres to a given "JSON Schema" instance.

"JSON Schema" is a declarative language that allows you to annotate and validate JSON documents.

For example, the example "JSON Schema" instance {{"properties": {{"foo": {{"description": "a list of test words", "type": "array", "items": {{"type": "string"}}}}}}, "required": ["foo"]}}}}
would match an object with one required property, "foo". The "type" property specifies "foo" must be an "array", and the "description" property semantically describes it as "a list of test words". The items within "foo" must be strings.
Thus, the object {{"foo": ["bar", "baz"]}} is a well-formatted instance of this example "JSON Schema". The object {{"properties": {{"foo": ["bar", "baz"]}}}} is not well-formatted.

Your output will be parsed and type-checked according to the provided schema instance, so make sure all fields in your output match the schema exactly and there are no trailing commas!

Here is the JSON Schema instance your output must adhere to. Include the enclosing markdown codeblock:
{"type":"object","properties":{"output":{"type":"object","properties":{"Prompt":{"type":"string"}},"additionalProperties":false}},"additionalProperties":false,"$schema":"http://json-schema.org/draft-07/schema#"}
```

4. For each generated image prompt, create row in `Baserow.SceneTable`. Save:
 - id
 - video id
 - duration
 - prompt
 
 ```
 ```


## Image Generation

1. Get all scenes for a video
2. For each scene, generate an image. Image is returned as a base 64 string.

```json

    POST "https://api.together.xyz/v1/images/generations"

    {
        "model": "black-forest-labs/FLUX.1-schnell-Free",
        "prompt": "<scene image prompt>",
        "width": 576,
        "height": 1024,
        "steps": 4,
        "n": 1,
        "response_format": "b64_json"
    }
```

3. Convert base64 string to binary.
4. Upload to Baserow media

```json
    POST "http://host.docker.internal:85/api/user-files/upload-file"
    -d FORM-DATA
```

5. Update `SceneTable."Image URL"`
```
```

## Generate Clips from Images
1. From Baserow `VideoTable`, pull record
2. Pull all images for related `Scene`
3. For each image, create clip:

```json
    POST "http://host.docker.internal:8080/v1/image/transform/video"

    {
        "image_url": "<scene image url>",
        "length": "<scene duration>",
        "frame_rate": 25,
        "zoom_speed": 3,
        "id": "<scene id>"
    }
```
