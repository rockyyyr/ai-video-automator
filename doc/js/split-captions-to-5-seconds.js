// Input from the previous step
const splitLength = 5;
const inputData = $input.first().json.Segments; // Assuming 'body' is passed from the previous node
const segments = [];
let currentSegment = {
    id: 0,
    words: "",
    duration: 0
};
let currentStartTime = -1; // Start before the first word
let totalDuration = 0; // Tracking total duration
let currentEndTime = 0;

// Define the pause buffer (in seconds)
const pauseBuffer = 0.1; // Adjust this value based on your requirements

// Loop through the input data
for (const wordObj of inputData) {
    const { word, start_time, end_time } = wordObj;

    // If this is the first word in a segment, set the start time
    if (currentStartTime === -1) {
        currentStartTime = start_time;
    }

    // Add the word to the current segment
    currentSegment.words += (currentSegment.words ? ' ' : '') + word;

    // Update the end time
    currentEndTime = end_time;

    // Keep track of the duration without pauses
    currentSegment.duration = (currentEndTime - currentStartTime).toFixed(2);

    // Check if we should finalize the current segment (if it exceeds 4 seconds)
    if (currentSegment.duration >= splitLength) {
        // Add pause buffer to the segment's duration before pushing it
        currentSegment.duration = (parseFloat(currentSegment.duration) + pauseBuffer).toFixed(2);

        // Update total duration for the segment
        totalDuration += parseFloat(currentSegment.duration);

        // Push the current segment to segments
        segments.push(currentSegment);

        // Reset for the next segment
        currentSegment = {
            id: segments.length,
            words: "",
            duration: 0
        };
        currentStartTime = -1; // Reset the start time
    }
}

// Handle any leftover words in the last segment
if (currentSegment.words) {
    currentSegment.duration = (currentEndTime - currentStartTime).toFixed(2);
    // Add pause buffer to the last segment's duration
    currentSegment.duration = (parseFloat(currentSegment.duration) + pauseBuffer).toFixed(2);

    totalDuration += parseFloat(currentSegment.duration); // Add last segment to total
    segments.push(currentSegment);
}

// Round total duration
const roundedTotalDuration = Math.round(totalDuration);

// Calculate total minutes and seconds
const totalSeconds = Math.floor(roundedTotalDuration);
const minutes = Math.floor(totalSeconds / 60);
const seconds = totalSeconds % 60;

// Create a readable format for the total runtime
const totalRuntimeString = `${minutes} minute${minutes !== 1 ? 's' : ''}, ${seconds} second${seconds !== 1 ? 's' : ''}`;

// Prepare output with segments, total duration, and total runtime string
const output = {
    segments: segments.map(segment => {
        return { json: segment };
    }),
    totalDuration: roundedTotalDuration,
    TotalMinutes: totalRuntimeString
};

// Return the structured output
return [{ json: output }];