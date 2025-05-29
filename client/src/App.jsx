import { useEffect, useState, useRef } from 'react';
import 'react-tabs/style/react-tabs.css';
import CreateForm from './components/CreateForm';
import VideoCards from './components/VideoCards';
import * as Api from './utils/Api';
import Paginator from './components/Paginator';
import { isEqual } from 'lodash';

const pageSize = 10;

export default function App() {
    const [inProgressVideos, setInProgressVideos] = useState([]);
    const [completedVideos, setCompletedVideos] = useState([]);
    const inProgressRef = useRef([]);
    const completedRef = useRef([]);
    const page = useRef(1);

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

            Api.getInProgressVideos()
                .then(inProgress => {
                    if (!isEqual(inProgress, inProgressRef.current)) {
                        inProgressRef.current = inProgress;
                        setInProgressVideos(inProgress);
                    }
                })
                .catch(error => console.error('Error fetching in-progress videos:', error));
        };

        fetchVideos();

        const interval = setInterval(fetchVideos, 5000); // Fetch every 5 seconds
        return () => clearInterval(interval); // Clear interval on component unmount
    }, []);

    const changePage = page => {
        page.current = page;

        Api.getCompletedVideos(page, pageSize)
            .then(completed => {
                completedRef.current = completed;
                setCompletedVideos(completed);
            })
            .catch(error => console.error('Error fetching completed videos:', error));
    };

    return (
        <>
            <main className="container-fluid">
                <section className='container'>
                    <h1>Generate Video</h1>
                    <CreateForm />
                </section>
            </main>

            <main className="container-fluid pico-background-blue-50">
                <section className='dark-text' style={{ padding: '0 50px' }}>
                    <h1>In Progress</h1>
                    <VideoCards videos={inProgressVideos} />
                </section>
            </main>

            <main className="container-fluid pico-background-blue-500">
                <section style={{ padding: '0 50px' }}>
                    <h1>Completed</h1>
                    <VideoCards className="dark-text" videos={completedVideos} />
                    <Paginator onChange={page => changePage(page)} />
                </section>
            </main>

        </>
    );
}

