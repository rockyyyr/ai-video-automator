import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    assetsInclude: ['./src/assets/fonts/*.ttf'],
    preview: {
        port: 5174,
    },
});
