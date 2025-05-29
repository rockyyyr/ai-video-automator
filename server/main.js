import 'dotenv/config';
import express from 'express';
import routes from './src/routes/index.js';
import cors from 'cors';

const server = express();

server.use(express.json());
server.use(cors());
server.use('/', routes);

server.listen(3000);
