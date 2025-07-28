import { useState, useEffect } from 'react';
import * as Api from '../utils/Api';
import { toast } from 'react-toastify';

export default function VideoModal({ video, open, onClose }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [script, setScript] = useState('');
    const [imagePrompts, setImagePrompts] = useState([]);

    useEffect(() => {
        if (open) {
            setTitle(video.Title || '');
            setDescription(video.Description || '');
            setScript(video.Script || '');
            setImagePrompts(video.scenes ? video.scenes.map(scene => ({ value: scene['Image Prompt'], changed: false })) : []);
        } else {
            setTitle('');
            setDescription('');
            setScript('');
            setImagePrompts([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const updateImagePrompts = (index, value) => {
        const updatedPrompts = [...imagePrompts];
        updatedPrompts[index].value = value;
        updatedPrompts[index].changed = true;
        setImagePrompts(updatedPrompts);
    };

    const updateVideo = async () => {
        for (let i = 0; i < imagePrompts.length; i++) {
            const scene = video.scenes[i];
            const prompt = imagePrompts[i];

            if (prompt.changed) {
                console.log(prompt);

                // await Api.updateImagePrompt(video.id, scene.id, prompt.value)
                //     .catch(error => {
                //         console.error('Error updating image prompt:', error);
                //         toast('Failed to update image prompt', {
                //             autoClose: 5000,
                //             hideProgressBar: true,
                //             className: 'notification-err'
                //         });
                //     });
            }
        }

        const data = {
            id: video.id,
            Title: title,
            Description: description,
            Script: script
        };

        if (script !== video.Script) {
            data.Step = 1;
            data.Error = true;
        }

        console.log(data);


        // await Api.updateVideo(data)
        //     .catch(error => {
        //         console.error('Error updating video:', error);
        //         toast('Failed to update video', {
        //             autoClose: 5000,
        //             hideProgressBar: true,
        //             className: 'notification-err'
        //         });
        //     });

        toast('Video updated successfully!', {
            autoClose: 5000,
            hideProgressBar: true,
            className: 'notification-success'
        });
        onClose();
    };

    return (video && (
        <dialog open={open}>
            <article style={{ maxWidth: 1000 }}>
                <form className='modal-form' style={{ color: '#e0e3e7' }}>
                    <label>
                        Title
                        <input value={title} onChange={e => setTitle(e.target.value)} />
                    </label>
                    <label>
                        Description
                        <textarea value={description} onChange={e => setDescription(e.target.value)} />
                    </label>
                    <label>
                        Script
                        <textarea rows={6} value={script} onChange={e => setScript(e.target.value)} />
                    </label>
                    <label>
                        Image Promts
                        {imagePrompts.length > 0 && imagePrompts.map((prompt, i) => (
                            <textarea rows={2} value={prompt.value} onChange={e => updateImagePrompts(i, e.target.value)} />
                        ))}
                    </label>
                </form>
                <footer>
                    <button
                        className='pico-background-blue-450'
                        style={{ color: 'white', border: 'none' }}
                        onClick={updateVideo}
                    >
                        {script !== video.Script ? 'Update Video' : 'Save'}
                    </button>
                    <button
                        className='pico-background-red-450'
                        style={{ color: 'white', border: 'none' }}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </footer>
            </article>
        </ dialog>
    )
    );
};