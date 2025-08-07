import { useState } from 'react';
import ImagePreview from './ImagePreview';
import * as Api from '../utils/Api';
import * as Env from '.../util/Env';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import VideoModal from './VideoModal';

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

export default function VideoCards({ videos = [], className = '', replacementImages }) {
    const [selectedVideo, setSelectedVideo] = useState(null);

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
        : (
            <>
                <VideoModal open={selectedVideo !== null} video={selectedVideo} onClose={() => setSelectedVideo(null)} />
                {videos.map(video => {
                    const videoSource = !video['Video With Captions URL']
                        ? ''
                        : Env.isRemote()
                            ? video['Video With Captions URL'].replace('host.docker.internal:9000', window.location.hostname)
                            : video['Video With Captions URL'].replace('host.docker.internal', window.location.hostname);
                    return (
                        <article className={`pico-background-blue-50 ${className}`} key={video.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: 30 }}>
                                    {(video.Title || video.Topic) && (
                                        <h6>{video.Title || video.Topic}</h6>
                                    )}
                                    <div>{dayjs(parseInt(video.Timestamp)).format('h:mma MMM DD')}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {video.Error && (
                                        <>
                                            <div style={{ color: 'red' }}>Video Stopped! Resume?</div>
                                            <div style={{ display: 'flex', gap: 10 }}>
                                                <button
                                                    onClick={() => restartVideo(video.id)}
                                                    className='pico-background-blue-500'
                                                    style={{ height: 40, lineHeight: 0, color: 'white' }}
                                                >
                                                    Resume
                                                </button>
                                            </div>
                                        </>
                                    )}
                                    <button
                                        onClick={() => deleteVideo(video.id)}
                                        className='outline '
                                        style={{ height: 40, lineHeight: 0, color: 'red', borderColor: 'red' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                                {/* <button
                                    onClick={() => setSelectedVideo(video)}
                                    className='outline '
                                    style={{ height: 40, lineHeight: 0, color: 'orange', borderColor: 'orange' }}
                                >
                                    Edit
                                </button> */}
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
                                        <ImagePreview key={scene.id} videoId={video.id} sceneId={scene.id} src={scene['Image URL']} replacementImages={replacementImages} />
                                    )) : 'N/A'}
                                </Item>
                                <VLine />
                                <Item label='Video'>
                                    {video['Video With Captions URL'] ? (
                                        <video
                                            autoPlay={false}
                                            controls
                                            className={'carousel-img carousel-video-hoverable'}
                                            src={videoSource}
                                            style={{ width: 'auto', height: 80 }}
                                        />
                                    ) : 'N/A'}
                                </Item>
                            </div>
                        </article>
                    );
                })
                }
            </>
        );
}