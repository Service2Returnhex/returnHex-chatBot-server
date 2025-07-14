import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import router from './App/Routes';
import { globalErrorHanlder } from './App/Middlewares/globalErrorHandler';
import notFound from './App/Middlewares/notFound';
import cookieParser from 'cookie-parser';
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

app.use("/api/v1", router);

app.get('/', (req, res) => {
    res.send("Hello Server");
})

app.use(notFound);
app.use(globalErrorHanlder);

export default app;