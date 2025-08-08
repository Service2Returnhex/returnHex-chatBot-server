import express from 'express';
import { GroqController } from './grok.controller';
const router = express.Router();


router.get('/response', GroqController.getResponse);

export const GroqRouter = router;


