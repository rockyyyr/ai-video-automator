import * as OpenRouter from './Openrouter.js';

const TITLE = /(?<=\*\*Title:\*\*)[\S|\s|.]*?(?=\*\*)/g;
const DESCRIPTION = /(?<=\*\*Description:\*\*)[\S|\s|.]*?(?=\*\*)/g;
const HOOK = /(?<=\*\*Hook:\*\*)[\S|\s|.]*?(?=\*\*)/g;
const MAINSCRIPT = /(?<=\*\*MainScript:\*\*)[\S|\s|.]*?(?=\*\*)/g;
const CTA = /(?<=\*\*Call to Action:\*\*)[\S|\s|.]*/g;

const topicInstructions = `
Act as a YouTube video scriptwriter who specializes in transforming user-submitted ideas—whether they are story concepts or intriguing facts—into engaging, bite-sized video scripts. The user will also provide a target video duration, which you should keep in mind while crafting the content and the script should be as close to the target video duration as possible. Stay within 5 seconds of the target duration. Your goal is to take these ideas and produce compelling, original content without referencing specific sources or names.

Your script should be engaging, energetic, and easy to follow, turning user concepts into captivating narratives within the specified video length. Use a conversational tone, vivid descriptions, and a strong hook to instantly grab attention. Keep the pacing snappy, ensuring that every second counts.

NEVER add linebreaks or emojis to the hook, main script & CTA

Output Format:
**Title:** [Catchy, curiosity-driven title based on user idea]  
**Description:** [50-150 characters, snappy summary with key hashtags relevant to the user’s topic]  
**Hook:** [An attention-grabbing opening line inspired by the user idea]  
**MainScript:** [A natural, spoken-style script without line breaks or emojis, tailored to the user-defined video length]  
**Call to Action:** [A compelling prompt encouraging viewers to engage, like "What was your favorite part of this story?" or "Want to explore more ideas? Follow for more!"]

Make sure the MainScript feels seamless and original, as if these insights are being shared firsthand. No direct references to names, specific sources, or the user—just pure, engaging storytelling that keeps viewers hooked.
`.trim();


const transcriptInstructions = `
Act as a YouTube video scriptwriter who specializes in transforming user-submitted transcripts into engaging, bite-sized video scripts. The user will also provide a target video length, which you should keep in mind while crafting the content and the script should be as close to the target video duration as possible. Stay within 5 seconds of the target duration. Your goal is to take this transcript and produce a compelling, video ready script.

Your script should be engaging, energetic, and easy to follow, turning the transcript into captivating narratives within the specified video length. Use a conversational tone, vivid descriptions, and a strong hook to instantly grab attention. Keep the pacing snappy, ensuring that every second counts.

NEVER add linebreaks or emojis to the hook, main script & CTA

Output Format:
**Title:** [Catchy, curiosity-driven title based on user idea]  
**Description:** [50-150 characters, snappy summary with key hashtags relevant to the user’s topic]  
**Hook:** [An attention-grabbing opening line inspired by the user idea]  
**MainScript:** [A natural, spoken-style script without line breaks or emojis, tailored to the user-defined video length]  
**Call to Action:** [A compelling prompt encouraging viewers to engage, like "What was your favorite part of this story?" or "Want to explore more ideas? Follow for more!"]

Make sure the MainScript feels seamless and original, as if these insights are being shared firsthand. No direct references to names, specific sources, or the user—just pure, engaging storytelling that keeps viewers hooked.
`.trim();


function topicPrompt(userInput) {
    return `
        System:

        ${topicInstructions}

        User Input:

        Rough Duration: ${userInput.duration} seconds

        Topic: ${userInput.topic}

        ${userInput.notes ? `Notes: \n\n${userInput.notes}` : ''}
    `;
}

function transcriptPrompt(userInput) {
    return `
        System:

        ${transcriptInstructions}

        User Input:

        Rough Duration: ${userInput.duration} seconds

        Transcript: 
        
        ${userInput.transcript}

        ${userInput.notes ? `Notes: \n\n${userInput.notes}` : ''}
    `;
}

function parseOutput(output) {
    if (output === '') {
        throw new Error('Empty response from OpenRouter. Probably rate limited.');
    }

    const title = output.match(TITLE)?.[0]?.trim();
    const description = output.match(DESCRIPTION)?.[0]?.trim();
    const hook = output.match(HOOK)?.[0]?.trim();
    const mainScript = output.match(MAINSCRIPT)?.[0]?.trim();
    const cta = output.match(CTA)?.[0]?.trim();

    if (!title || !description || !hook || !mainScript || !cta) {
        if (!title) {
            throw new Error('Title not found');
        } else if (!description) {
            throw new Error('Description not found');
        } else if (!hook) {
            throw new Error('Hook not found');
        } else if (!mainScript) {
            throw new Error('MainScript not found');
        } else if (!cta) {
            throw new Error('CTA not found');
        }
    }

    const script = [hook, mainScript, cta].join('\n\n');

    return {
        title,
        description,
        script
    };
}

async function generateScript(userInput, promptFunction) {
    const response = await OpenRouter.createPrompt(promptFunction(userInput));
    const { title, description, script } = parseOutput(response);

    return {
        title,
        description,
        script
    };
}

export async function scriptFromTopic(userInput) {
    return generateScript(userInput, topicPrompt);
}

export async function scriptFromTranscript(userInput) {
    return generateScript(userInput, transcriptPrompt);
}

function roundTo(value, precision) {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
};

export function chuckScriptIntoScenes(captions, timeInSeconds) {
    const endPadDuration = 0.3;
    let scenes = [];
    let currentWords = [];
    let currentScene = 1;
    let sceneStartTime = 0;

    for (let i = 0; i < captions.length; i++) {
        const { word, end_time } = captions[i];

        currentWords.push(word);

        if (end_time - sceneStartTime >= timeInSeconds || i === captions.length - 1) {
            scenes.push({
                id: currentScene++,
                words: currentWords.join(' '),
                duration: end_time - sceneStartTime,
            });

            sceneStartTime = end_time;
            currentWords = [];
        }
    }

    const finalScene = scenes[scenes.length - 1];

    if (finalScene.duration < 2.5) {
        const scene = scenes.pop();
        scenes[scenes.length - 1].words += ' ' + scene.words;
        scenes[scenes.length - 1].duration += scene.duration;
    }

    if (scenes.length > 0) {
        scenes[scenes.length - 1].duration += endPadDuration;
    }

    const totalDuration = scenes.reduce((acc, scene) => acc + scene.duration, 0);

    return {
        segments: scenes.map(x => ({ ...x, duration: roundTo(x.duration, 2) })),
        totalDuration: roundTo(totalDuration, 2)
    };
}

// export function chuckScriptIntoScenes(captions, timeInSeconds) {
//     // Input from the previous step
//     const splitLength = timeInSeconds;
//     const inputData = captions;
//     const segments = [];

//     let currentSegment = {
//         id: 1,
//         words: "",
//         duration: 0,
//     };

//     let currentStartTime = -1; // Start before the first word
//     let totalDuration = 0; // Tracking total duration
//     let currentEndTime = 0;

//     // Define the pause buffer (in seconds)
//     const pauseBuffer = 0.1; // Adjust this value based on your requirements

//     // Loop through the input data
//     for (const wordObj of inputData) {
//         const { word, start_time, end_time } = wordObj;

//         // If this is the first word in a segment, set the start time
//         if (currentStartTime === -1) {
//             currentStartTime = start_time;
//         }

//         // Add the word to the current segment
//         currentSegment.words += (currentSegment.words ? ' ' : '') + word;

//         // Update the end time
//         currentEndTime = end_time;

//         // Keep track of the duration without pauses
//         currentSegment.duration = (currentEndTime - currentStartTime).toFixed(2);

//         // Check if we should finalize the current segment (if it exceeds 4 seconds)
//         if (currentSegment.duration >= splitLength) {
//             // Add pause buffer to the segment's duration before pushing it
//             currentSegment.duration = parseFloat((parseFloat(currentSegment.duration) + pauseBuffer).toFixed(2));

//             // Update total duration for the segment
//             totalDuration += parseFloat(currentSegment.duration);

//             // Push the current segment to segments
//             segments.push(currentSegment);

//             // Reset for the next segment
//             currentSegment = {
//                 id: segments.length + 1,
//                 words: "",
//                 duration: 0,
//             };
//             currentStartTime = -1; // Reset the start time
//         }
//     }

//     // Handle any leftover words in the last segment
//     if (currentSegment.words) {
//         currentSegment.duration = (currentEndTime - currentStartTime).toFixed(2);
//         // Add pause buffer to the last segment's duration
//         currentSegment.duration = parseFloat((parseFloat(currentSegment.duration) + pauseBuffer).toFixed(2));

//         totalDuration += parseFloat(currentSegment.duration); // Add last segment to total
//         segments.push(currentSegment);
//     }

//     // Round total duration
//     const roundedTotalDuration = Math.round(totalDuration);

//     // Calculate total minutes and seconds
//     const totalSeconds = Math.floor(roundedTotalDuration);
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;

//     // Create a readable format for the total runtime
//     const totalRuntimeString = `${minutes} minute${minutes !== 1 ? 's' : ''}, ${seconds} second${seconds !== 1 ? 's' : ''}`;

//     const output = {
//         segments,
//         totalDuration: roundedTotalDuration,
//         TotalMinutes: totalRuntimeString
//     };

//     return output;
// }
