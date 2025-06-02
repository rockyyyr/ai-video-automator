import { useEffect, useState } from 'react';
import PreviewImage from '../assets/img/preview-image.jpeg';
import * as Api from '../utils/Api';
import { toast } from 'react-toastify';
import fonts from '../utils/fonts';

const defaultSettings = {
    line_color: "#FFFFFF",
    word_color: "#22b525",
    max_words_per_line: 3,
    font_size: 80,
    outline_width: 6,
    shadow_offset: 8,
    all_caps: true,
    bold: false,
    italic: false,
    underline: false,
    strikeout: false,
    style: "highlight",
    font_family: "The Bold Font",
    position: "top_center",
};

export default function CaptionEditor() {
    const [profiles, setProfiles] = useState([]);
    const [loadedProfile, setLoadedProfile] = useState(null);
    const [profileName, setProfileName] = useState('');
    const [settings, setSettings] = useState(defaultSettings);

    const fetchProfiles = () => {
        Api.getCaptionProfiles()
            .then(profiles => profiles?.filter(x => x.settings).length && setProfiles(profiles));
    };

    const loadProfile = profileId => {
        const profile = profiles.find(profile => profile.id === profileId);
        if (profile?.settings) {
            setSettings(() => ({ ...JSON.parse(profile.settings) }));
            setProfileName('');
            setLoadedProfile(profile);
            setProfileName(profile.profileName || '');
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const Preview = () => {
        const fontSize = settings.font_size * 0.8;
        const shadowOffset = settings.shadow_offset / 2;
        const textStyle = {
            textAnchor: 'middle',
            fill: settings.line_color,
            fontSize: fontSize,
            fontFamily: settings.font_family,
            fontWeight: settings.bold ? 'bold' : 'normal',
            fontStyle: settings.italic ? 'italic' : 'normal',
            textDecoration: settings.underline ? 'underline' : 'none',
            textTransform: settings.all_caps ? 'uppercase' : 'none',
            stroke: 'black',
            strokeWidth: settings.outline_width / 2,
            strokeLinecap: 'round',
            filter: `drop-shadow( ${shadowOffset}px ${shadowOffset}px 0px rgba(0, 0, 0, 1))`,
        };

        return (
            <div style={{ position: 'relative' }}>
                <img src={PreviewImage} alt="Preview" style={{ width: 560, height: 'auto', borderRadius: 10 }} />
                <div style={{
                    width: 560,
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    top: settings.position === 'top_center' ? 50 : settings.position === 'middle_center' ? '42%' : 'auto',
                    bottom: settings.position === 'bottom_center' ? 50 : 'auto',
                }}>
                    <svg style={{ width: '100%', wordBreak: 'break-word', wordWrap: 'break-word' }}>
                        <text y='50%' x='50%' style={textStyle}><tspan style={{ fill: settings.word_color }}>Caption</tspan> Text</text>
                    </svg>
                </div>
            </div>
        );
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (profileName === loadedProfile?.profileName) {
            Api.updateProfile(loadedProfile.id, { profileName, settings: JSON.stringify(settings) })
                .then(fetchProfiles);
        } else {
            Api.saveProfile({ profileName, settings: JSON.stringify(settings) })
                .then(() => {
                    Api.getCaptionProfiles()
                        .then(profiles => {
                            const profile = profiles.find(profile => profile.profileName === profileName);
                            if (profile.settings) {
                                setProfiles(profiles);
                                setLoadedProfile(profile);
                                setProfileName('');
                                setSettings(() => ({ ...JSON.parse(profile.settings) }));
                            }
                        });
                });
        }
        toast('Caption profile saved!', {
            autoClose: 5000,
            hideProgressBar: true,
            className: 'notification-success'
        });
    };

    return (
        <div className="caption-editor">
            <div style={{ width: '100%' }}>
                <h1>Caption Editor</h1>
                <form onSubmit={onSubmit}>
                    <fieldset className='grid'>
                        <label>
                            Profiles
                            <select value={loadedProfile?.id} onChange={(e) => loadProfile(parseInt(e.target.value))} disabled={profiles.length === 0}>
                                <option value="">Select Profile</option>
                                {profiles.map(profile => (
                                    <option key={profile.id} value={profile.id}>{profile.profileName}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Profile Name
                            <input type='text' value={profileName} onChange={(e) => setProfileName(e.target.value)} required />
                        </label>
                    </fieldset>
                    <fieldset className='grid'>
                        <label>
                            Font Color
                            <input type='color' value={settings.line_color} onChange={(e) => setSettings({ ...settings, line_color: e.target.value })} required />
                        </label>
                        <label>
                            Highlight Color
                            <input type='color' value={settings.word_color} onChange={(e) => setSettings({ ...settings, word_color: e.target.value })} required />
                        </label>
                    </fieldset>
                    <fieldset className='grid'>
                        <label>
                            Max Words Per Line
                            <input type='number' value={settings.max_words_per_line} onChange={(e) => setSettings({ ...settings, max_words_per_line: parseInt(e.target.value) })} required />
                        </label>
                        <label>
                            Font Size
                            <input type='number' value={settings.font_size} onChange={(e) => setSettings({ ...settings, font_size: parseInt(e.target.value) })} required />
                        </label>
                    </fieldset>
                    <fieldset className='grid'>
                        <label>
                            Outline Width
                            <input type='number' value={settings.outline_width} onChange={(e) => setSettings({ ...settings, outline_width: parseInt(e.target.value) })} required />
                        </label>
                        <label>
                            Shadow Offset
                            <input type='number' value={settings.shadow_offset} onChange={(e) => setSettings({ ...settings, shadow_offset: parseInt(e.target.value) })} required />
                        </label>
                    </fieldset>
                    <fieldset className='grid'>
                        <label>
                            Italic
                            <input style={{ marginLeft: 12 }} type='checkbox' checked={settings.italic} onChange={(e) => setSettings(() => ({ ...settings, italic: e.target.checked }))} />
                        </label>
                        <label>
                            All Caps
                            <input style={{ marginLeft: 12 }} type='checkbox' checked={settings.all_caps} onChange={(e) => setSettings(() => ({ ...settings, all_caps: e.target.checked }))} />
                        </label>
                        <label>
                            Bold
                            <input style={{ marginLeft: 12 }} type='checkbox' checked={settings.bold} onChange={(e) => setSettings(() => ({ ...settings, bold: e.target.checked }))} />
                        </label>
                        <label>
                            Underline
                            <input style={{ marginLeft: 12 }} type='checkbox' checked={settings.underline} onChange={(e) => setSettings(() => ({ ...settings, underline: e.target.checked }))} />
                        </label>
                    </fieldset>
                    <fieldset className='grid'>
                        <label>
                            Font Family
                            <select value={settings.font_family} onChange={(e) => setSettings({ ...settings, font_family: e.target.value })} required>
                                {fonts.map(font => (
                                    <option key={font} value={font}>{font}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Position
                            <select value={settings.position} onChange={(e) => setSettings({ ...settings, position: e.target.value })} required>
                                <option value="top_center">Top</option>
                                <option value="middle_center">Middle</option>
                                <option value="bottom_center">Bottom</option>
                            </select>
                        </label>
                        <label>
                            Highlighting
                            <select value={settings.style} onChange={(e) => setSettings({ ...settings, style: e.target.value })} required>
                                <option value="classic">Classic</option>
                                <option value="highlight">Color</option>
                                <option value="karaoke">Karaoke</option>
                                <option value="underline">Underline</option>
                                <option value="word_by_word">Word by Word</option>
                            </select>
                        </label>
                    </fieldset>
                    <button type='submit' disabled={loadedProfile?.profileName === profileName && profileName === 'Default'}>{loadedProfile?.profileName === profileName ? 'Update' : 'Create'}</button>
                </form>
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                <Preview />
            </div>
        </div>
    );
};