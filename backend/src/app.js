import express, { urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

// setup cors
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// setup data receiving method
app.use(express.json({ limit: "16kb" }));
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static('public'));


// import userRouter
import userRouter from './routes/user.routes.js';
// user test route
app.get('/api/v1/test',(req, res)=>res.status(200).json({serverStatus: "Good"}));
// use userrouter for redirecting to router page
app.use('/api/v1/users', userRouter);
// http://localhost:3000/api/v1/users

export { app };
