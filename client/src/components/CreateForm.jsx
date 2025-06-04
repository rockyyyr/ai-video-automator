import { useState } from 'react';
import Voices from '../utils/Voice';
import * as Api from '../utils/Api';
import { toast } from 'react-toastify';

const Defaults = {
    DURATION: 25,
    TTS_SPEED: 1.3,
    SCENE_LENGTH: 5,
    TTS_VOICE: Voices.Male.ONYX,
    GENERATIVE_STYLE: 'Anime'
};

export default function CreateForm({ onSubmit, captionProfiles }) {
    const [topic, setTopic] = useState('');
    const [transcript, setTranscript] = useState('');
    const [script, setScript] = useState('');
    const [notes, setNotes] = useState('');
    const [captionProfile, setCaptionProfile] = useState(import.meta.env.VITE_DEFAULT_CAPTION_PROFILE);
    const [duration, setDuration] = useState(Defaults.DURATION);
    const [generativeStyle, setGenerativeStyle] = useState(Defaults.GENERATIVE_STYLE);
    const [ttsVoice, setTtsVoice] = useState(Defaults.TTS_VOICE);
    const [ttsSpeed, setTtsSpeed] = useState(Defaults.TTS_SPEED);
    const [sceneLength, setSceneLength] = useState(Defaults.SCENE_LENGTH);

    useState(() => {
        if (captionProfiles && captionProfiles.length > 0) {
            const defaultProfile = captionProfiles.find(profile => profile.profileName === 'Default');
            setCaptionProfile(defaultProfile?.id);
        }
    }, [captionProfiles]);

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
            script,
            notes,
            duration,
            generativeStyle,
            ttsVoice,
            ttsSpeed,
            sceneLength,
            captionProfile
        };

        try {
            await Api.generateVideo(userInput);
            onSubmit();

            toast('Video generation started successfully!', {
                autoClose: 5000,
                hideProgressBar: true,
                className: 'notification-success'
            });

        } catch (error) {
            console.error('Error submitting form:', error);
            toast('Video generation failed!', {
                autoClose: 5000,
                hideProgressBar: true,
                className: 'notification-err'
            });
        }
    };

    return (
        <>
            <h1>Generate Video</h1>
            <form onSubmit={handleSubmit}>
                <fieldset className="grid">
                    <label htmlFor="topic">
                        Topic
                        <textarea id="topic" rows={3} resizable="true" onChange={setValue(setTopic)} required={!transcript && !script} />
                    </label>

                    <label htmlFor="transcript">
                        Transcript
                        <textarea id="transcript" rows={3} resizable="true" onChange={setValue(setTranscript)} required={!topic && !script} />
                    </label>

                </fieldset>
                <fieldset className="grid">
                    {import.meta.env.VITE_SHOW_SCRIPT_OPTION && (
                        <label htmlFor="script">
                            Script
                            <textarea id="script" rows={3} resizeable="true" onChange={setValue(setScript)} required={!topic && !transcript} />
                        </label>
                    )}

                    <label htmlFor="notes">
                        Notes (Optional)
                        <textarea id="notes" rows={3} resizeable="true" onChange={setValue(setNotes)} disabled={script} />
                    </label>
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
                    <label htmlFor="captionProfile">
                        Caption Profile
                        <select id="captionProfile" onChange={setValue(setCaptionProfile)} value={captionProfile}>
                            {captionProfiles.map(profile => (
                                <option key={profile.id} value={profile.id}>
                                    {profile.profileName}
                                </option>
                            ))}
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
                        <input id="ttsSpeed" type="number" min="0.5" max="4.0" step="0.05" defaultValue={Defaults.TTS_SPEED} onChange={setValue(setTtsSpeed)} required />
                    </label>

                    <label htmlFor="sceneLength">
                        Scene Length (in seconds)
                        <input id="sceneLength" type="number" min="1" max="60" defaultValue={Defaults.SCENE_LENGTH} onChange={setValue(setSceneLength)} required />
                    </label>

                </fieldset>
                <button type="submit">Generate</button>
            </form>
        </>
    );
};