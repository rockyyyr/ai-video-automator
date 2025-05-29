import ImagePreview from './ImagePreview';
import * as Api from '../utils/Api';

const Item = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {label && (<strong style={{ textAlign: 'left' }}>{label}</strong>)}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
            {children}
        </div>
    </div>
);

const VLine = () => (
    <div className='vLine'></div>
);

export default function VideoCards({ videos = [], className = '' }) {

    const restartVideo = videoId => {
        Api.restartVideo(videoId)
            .then(() => alert('Video restarted successfully!'))
            .catch(error => alert(`Error restarting video: ${error.message}`));
    };

    return !videos.length
        ? (<h5>Nothing</h5>)
        : videos.map(video => (
            <article className={`pico-background-blue-50 ${className}`} key={video.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h6>{video.Title || 'N/A'}</h6>
                    {video.Error && (
                        <>
                            <div style={{ color: 'red' }}>Video Errored! Resume?</div>
                            <button
                                onClick={() => restartVideo(video.id)}
                                className='pico-background-blue-500'
                                style={{ height: 40, lineHeight: 0, color: 'white' }}
                            >
                                Resume
                            </button>
                        </>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 20, justifyContent: 'space-between', padding: '0 30px' }}>
                    <Item label="Progress">
                        <div>{video.Step}/9</div>
                    </Item>
                    <VLine />
                    <Item label="Duration">
                        <div>{video['Actual Duration'] || 0}s</div>
                    </Item>
                    <VLine />
                    <Item label="# of Scenes">
                        <div>{video['# of Scenes'] || 0}</div>
                    </Item>
                    <VLine />
                    <Item label='Scene Length'>
                        <div>{video['Scene Length']}s</div>
                    </Item>
                    <VLine />
                    <Item label='TTS Voice'>
                        <div>{video['TTS Voice']}</div>
                    </Item>
                    <VLine />
                    <Item label='TTS Speed'>
                        <div>{video['TTS Speed']}</div>
                    </Item>
                    <VLine />
                    <Item label='Scenes'>
                        {video.scenes.filter(scene => scene['Image URL']).length ? video.scenes.map(scene => (
                            <ImagePreview key={scene.id} src={scene['Image URL']} />
                        )) : 'N/A'}
                    </Item>
                    <VLine />
                    <Item label='Video'>
                        {video['Video With Captions URL'] ? (
                            // <VideoPreview src={video['Video With Captions URL']} />
                            <video
                                autoPlay={false}
                                controls
                                className={'carousel-img carousel-video-hoverable'}
                                src={video['Video With Captions URL']?.replace('host.docker.internal', 'localhost')}
                                style={{ width: 'auto', height: 80 }}
                            />
                        ) : 'N/A'}
                    </Item>
                </div>
            </article>
        ));
}