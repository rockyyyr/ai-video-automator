import { useState } from 'react';



export default function ImagePreview({ src, children }) {
    const [open, setOpen] = useState(false);

    const Image = ({ height, hoverable = false }) => (
        <img
            className={hoverable ? 'carousel-img carousel-img-hoverable' : 'carousel-img'}
            src={src.replace('host.docker.internal', 'localhost')}
            style={{
                width: 'auto',
                height: height
            }}
        />
    );

    return (
        <div onClick={() => setOpen(prev => !prev)}>
            {children || (<Image hoverable height={80} />)}
            <dialog open={open}>
                {children || <Image height={1000} />}
            </dialog>
        </div>
    );
}