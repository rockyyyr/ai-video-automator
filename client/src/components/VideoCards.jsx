import ImagePreview from './ImagePreview';
import * as Api from '../utils/Api';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

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
            .then(() => toast('Video restarted!', {
                autoClose: 5000,
                hideProgressBar: true,
                className: 'notification-success'
            }))
            .catch(error => toast(error.message, {
                autoClose: 5000,
                hideProgressBar: true,
                className: 'notification-success'
            }));
    };

    const deleteVideo = videoId => {
        Api.deleteVideo(videoId)
            .then(() => {
                toast('Video deleted!', {
                    autoClose: 5000,
                    hideProgressBar: true,
                    className: 'notification-success'
                });
            })
            .catch(error => toast(error.message, {
                autoClose: 5000,
                hideProgressBar: true,
                className: 'notification-err'
            }));
    };

    return !videos.length
        ? (<h5>Nothing</h5>)
        : videos.map(video => (
            <article className={`pico-background-blue-50 ${className}`} key={video.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h6>{video.Title || video.Topic}</h6>
                    <div>{dayjs(parseInt(video.Timestamp)).format('h:mma MMM DD')}</div>
                    {video.Error && (
                        <>
                            <div style={{ color: 'red' }}>Video Errored! Resume?</div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    onClick={() => restartVideo(video.id)}
                                    className='pico-background-blue-500'
                                    style={{ height: 40, lineHeight: 0, color: 'white' }}
                                >
                                    Resume
                                </button>
                                <button
                                    onClick={() => deleteVideo(video.id)}
                                    className='outline '
                                    style={{ height: 40, lineHeight: 0, color: 'red', borderColor: 'red' }}
                                >
                                    Delete
                                </button>
                            </div>
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
                        {video.scenes ? video.scenes.map(scene => (
                            <ImagePreview key={scene.id} videoId={video.id} sceneId={scene.id} src={scene['Image URL']} />
                        )) : 'N/A'}
                    </Item>
                    <VLine />
                    <Item label='Video'>
                        {video['Video With Captions URL'] ? (
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