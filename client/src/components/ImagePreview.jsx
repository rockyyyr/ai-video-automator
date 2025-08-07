import { useState } from 'react';
import * as Api from '../utils/Api';
import * as Env from '../utils/Env';

import MissingImage from '../assets/img/missing-image.png';

export default function ImagePreview({ src, videoId, sceneId }) {
    const [open, setOpen] = useState(false);

    const source = !src
        ? MissingImage
        : Env.isRemote()
            ? src.replace('host.docker.internal:9000', window.location.hostname)
            : src.replace('host.docker.internal', window.location.hostname);

    const Image = ({ width, hoverable = false, style }) => (
        <img
            className={(hoverable && src) ? 'carousel-img carousel-img-hoverable' : 'carousel-img'}
            src={source}
            style={{
                width,
                height: 'auto',
                ...style
            }}
        />
    );

    const deleteImage = () => {
        Api.deleteImage(videoId, sceneId)
            .then(() => setOpen(false))
            .catch(error => console.error('Error deleting image:', error));
    };

    return (
        <div onClick={() => src && setOpen(prev => !prev)}>
            <Image hoverable width={45} />
            <dialog open={open}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 15 }}>
                    <Image width={500} style={{ borderRadius: 10 }} />
                    <button
                        className='pico-background-red-450'
                        style={{ width: '100%', color: 'white', border: 'none' }}
                        onClick={deleteImage}
                    >
                        Delete Image
                    </button>
                </div>
            </dialog>
        </div>
    );
}