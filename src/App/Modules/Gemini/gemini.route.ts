import express from 'express';
const router = express.Router();
import { GeminiController } from './gemini.controller';

router.get('/response', GeminiController.getResponse);

export const GeminiRouter = router;


