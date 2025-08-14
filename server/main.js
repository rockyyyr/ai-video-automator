import 'dotenv/config';
import express from 'express';
import routes from './src/routes/index.js';
import cors from 'cors';

import * as Database from './src/lib/Database.js';

const server = express();

server.use(express.json());
server.use(cors());
server.use('/', routes);

server.listen(3000);

(async () => {
    try {
        const inProgress = await Database.find(Database.Tables.VIDEOS, [
            {
                field: 'Step',
                type: 'not_equal',
                value: 9
            },
            {
                field: 'Error',
                value: false
            }
        ]);

        await Database.updateBatch(Database.Tables.VIDEOS, inProgress.map(video => video.id), { Error: true });

    } catch (error) {
        console.error('Error initializing in-progress videos');
        console.log(error);

    }
})();
