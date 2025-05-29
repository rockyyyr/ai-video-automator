import { useState } from 'react';

export default function VideoPreview({ src }) {
    const [open, setOpen] = useState(false);

    const Video = ({ height, hoverable = false }) => (
        <video
            autoPlay={false}
            controls
            className={hoverable ? 'carousel-img carousel-img-hoverable' : 'carousel-img'}
            src={src?.replace('host.docker.internal', 'localhost')}
            style={{ width: 'auto', height }}
        />
    );

    return (
        <div>
            <Video height={80} hoverable onClick={() => setOpen(prev => !prev)} />
            <dialog open={open}>
                <Video height={1000} />
            </dialog>
        </div>
    );
}