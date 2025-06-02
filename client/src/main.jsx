import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/css/base.css';
import './assets/css/fonts.css';
import '@picocss/pico';
import '@picocss/pico/css/pico.colors.min.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
