import express from 'express'
import { DeepSeekController } from './deepseek.controller';

const router = express.Router();



router.get('/response', DeepSeekController.getResponse);


export const DeepSeekRouter = router;