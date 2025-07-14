import express from 'express'
import { ChatgptController } from './chatgpt.controller';

const router = express.Router();



router.get('/response', ChatgptController.getResponse);


export const ChatgptRouter = router;