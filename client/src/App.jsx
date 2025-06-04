import { useEffect, useState, useRef } from 'react';
import 'react-tabs/style/react-tabs.css';
import CreateForm from './components/CreateForm';
import VideoCards from './components/VideoCards';
import * as Api from './utils/Api';
import Paginator from './components/Paginator';
import { isEqual } from 'lodash';
import Sidebar from './components/Sidebar';
import CaptionEditor from './components/CaptionEditor';
import Cancel from './assets/img/cancel.svg';
import { ToastContainer } from 'react-toastify';

const pageSize = 10;

function CloseButton({ closeToast }) {
    return (
        <i onClick={closeToast} className='notification-close-button-container'>
            <img src={Cancel} className='notification-close-button' />
        </i>
    );
}


export default function App() {
    const [inProgressVideos, setInProgressVideos] = useState([]);
    const [completedVideos, setCompletedVideos] = useState([]);
    const [captionProfiles, setCaptionProfiles] = useState([]);

    const inProgressRef = useRef([]);
    const completedRef = useRef([]);
    const page = useRef(1);

    const getInProgress = () => {
        Api.getInProgressVideos()
            .then(inProgress => {
                if (!isEqual(inProgress, inProgressRef.current)) {
                    inProgressRef.current = inProgress;
                    setInProgressVideos(inProgress);
                }
            })
            .catch(error => console.error('Error fetching in-progress videos:', error));
    };

    useEffect(() => {
        const fetchVideos = () => {
            Api.getCompletedVideos(page.current, pageSize)
                .then(completed => {
                    if (completed.length !== completedRef.current?.length) {
                        completedRef.current = completed;
                        setCompletedVideos(completed);
                    }
                })
                .catch(error => console.error('Error fetching completed videos:', error));

            getInProgress();

            Api.getCaptionProfiles()
                .then(setCaptionProfiles)
                .catch(error => console.error('Error fetching caption profiles:', error));
        };

        fetchVideos();


        const interval = setInterval(fetchVideos, 5000); // Fetch every 5 seconds
        return () => clearInterval(interval); // Clear interval on component unmount
    }, []);

    const changePage = nextPage => {
        page.current = nextPage;

        Api.getCompletedVideos(nextPage, pageSize)
            .then(completed => {
                completedRef.current = completed;
                setCompletedVideos(completed);
            })
            .catch(error => console.error('Error fetching completed videos:', error));
    };

    return (
        <>
            <ToastContainer closeButton={CloseButton} />
            <main className="container-fluid">
                <Sidebar tabs={[
                    { label: 'GENERATE', component: <CreateForm onSubmit={getInProgress} captionProfiles={captionProfiles} /> },
                    { label: 'CAPTIONS', component: <CaptionEditor /> }
                ]} />
            </main>

            {inProgressVideos.length > 0 && (
                <main className="container-fluid pico-background-blue-50">
                    <section className='dark-text' style={{ padding: '0 50px' }}>
                        <h1>In Progress</h1>
                        <VideoCards videos={inProgressVideos} />
                    </section>
                </main>
            )}

            <main className="container-fluid pico-background-blue-500">
                <section style={{ padding: '0 50px' }}>
                    <h1>Completed</h1>
                    <VideoCards className="dark-text" videos={completedVideos} />
                    <Paginator currentPage={page.current} onChange={page => changePage(page)} />
                </section>
            </main>

        </>
    );
}

