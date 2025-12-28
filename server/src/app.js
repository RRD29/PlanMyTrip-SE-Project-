import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config/index.js';
import mainRouter from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();




app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true,
}));




app.use(express.json({ limit: '16kb' }));


app.use(express.urlencoded({ extended: true, limit: '16kb' }));


app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));


app.use(cookieParser());



app.use('/api/v1', mainRouter);




app.use(errorHandler);

export { app };
