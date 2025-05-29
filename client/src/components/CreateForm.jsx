import { useState } from 'react';
import Voices from '../utils/Voice';
import * as Api from '../utils/Api';

const DEFAULT_DURATION = 25;
const Defaults = {
    DURATION: 25,
    TTS_SPEED: 1.3,
    SCENE_LENGTH: 5,
    TTS_VOICE: Voices.Male.ONYX,
    GENERATIVE_STYLE: 'Anime'
};

export default function CreateForm() {
    const [topic, setTopic] = useState('');
    const [transcript, setTranscript] = useState('');
    const [notes, setNotes] = useState('');
    const [duration, setDuration] = useState(Defaults.DURATION);
    const [generativeStyle, setGenerativeStyle] = useState(Defaults.GENERATIVE_STYLE);
    const [ttsVoice, setTtsVoice] = useState(Defaults.TTS_VOICE);
    const [ttsSpeed, setTtsSpeed] = useState(Defaults.TTS_SPEED);
    const [sceneLength, setSceneLength] = useState(Defaults.SCENE_LENGTH);

    const setValue = (setter) => (e) => {
        setter(e.target.value);
    };

    const generateStyleOptions = [
        'Hyper-Realistic',
        'Anime',
        'Lego',
        'Minecraft',
        'Hand-drawn',
        'Chibi',
        'Cyberpunk',
        'Fantasy',
        'Disney Pixar'
    ];

    const maleVoices = () => Object.keys(Voices.Male).map(key => (
        <option key={Voices.Male[key]} value={Voices.Male[key]} >
            Male: {key}
        </option>
    ));

    const femaleVoices = () => Object.keys(Voices.Female).map(key => (
        <option key={Voices.Female[key]} value={Voices.Female[key]} >
            Female: {key}
        </option>
    ));

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userInput = {
            topic,
            transcript,
            notes,
            duration,
            generativeStyle,
            ttsVoice,
            ttsSpeed,
            sceneLength
        };

        try {
            await Api.generateVideo(userInput);
            alert('Video generation started successfully!');

        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to start video generation. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset className="grid">
                <label htmlFor="topic">
                    Topic
                    <textarea id="topic" rows={3} resizable="true" onChange={setValue(setTopic)} required={!transcript} />
                </label>

                <label htmlFor="transcript">
                    Transcript
                    <textarea id="transcript" rows={3} resizable="true" onChange={setValue(setTranscript)} required={!topic} />
                </label>

            </fieldset>
            <fieldset>

                <label htmlFor="notes">Notes (Optional)</label>
                <textarea id="notes" rows={2} resizeable="true" onChange={setValue(setNotes)} />

            </fieldset>
            <fieldset className="grid">
                <label htmlFor="generativeStyle">
                    Generative Style
                    <select id="generativeStyle" onChange={setValue(setGenerativeStyle)} defaultValue={Defaults.GENERATIVE_STYLE} required>
                        {generateStyleOptions.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>

                <label htmlFor="ttsVoice">
                    TTS Voice
                    <select id="ttsVoice" defaultValue={Defaults.TTS_VOICE} onChange={setValue(setTtsVoice)} required>
                        {maleVoices()}
                        {femaleVoices()}
                    </select>
                </label>
            </fieldset>

            <fieldset className="grid">

                <label htmlFor="duration">
                    Rough Duration (in seconds)
                    <input id="duration" type="number" defaultValue={Defaults.DURATION} onChange={setValue(setDuration)} required />
                </label>

                <label htmlFor="ttsSpeed">
                    TTS Speed
                    <input id="ttsSpeed" type="number" min="0.5" max="2.0" step="0.1" defaultValue={Defaults.TTS_SPEED} onChange={setValue(setTtsSpeed)} required />
                </label>

                <label htmlFor="sceneLength">
                    Scene Length (in seconds)
                    <input id="sceneLength" type="number" min="1" max="60" defaultValue={Defaults.SCENE_LENGTH} onChange={setValue(setSceneLength)} required />
                </label>

            </fieldset>
            <button type="submit">Generate</button>
        </form>
    );
};