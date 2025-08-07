import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    assetsInclude: ['./src/assets/fonts/*.ttf'],
    preview: {
        port: 5174,
        allowedHosts: ['tahr-precious-lemur.ngrok-free.app', '10.0.0.109', 'localhost'],
        proxy: {
            '/api': {
                target: 'http://localhost:3000', // your API server
                changeOrigin: true,
                // if your API doesn't need the /api prefix, strip it:
                rewrite: (p) => p.replace(/^\/api/, ''),
            }
        }
    },
});
