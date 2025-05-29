// Assume the previous node output is available here
const inputSegments = $input.first().json.segments; // Accessing segments from the previous output

if (inputSegments.length > 0) {
    const lastSegment = inputSegments[inputSegments.length - 1].json;

    // Check if the last segment's duration is less than 2 seconds
    if (parseFloat(lastSegment.duration) < 2.0) {
        // Combine the last segment with the previous segment if it exists
        if (inputSegments.length > 1) {
            const secondLastSegment = inputSegments[inputSegments.length - 2].json;

            // Update the second last segment's words and duration
            secondLastSegment.words += ' ' + lastSegment.words;
            secondLastSegment.duration = (
                parseFloat(secondLastSegment.duration) +
                parseFloat(lastSegment.duration)
            ).toFixed(2); // Update duration

            // Remove the last segment as it has been merged
            inputSegments.pop();
        }
    }
}

// Return the updated segments
return [{ json: { segments: inputSegments } }];