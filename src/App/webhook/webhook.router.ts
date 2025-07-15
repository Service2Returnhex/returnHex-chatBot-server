import express from 'express';
import { WebHookController } from './webhook.controller';
const router = express.Router();

router.get('/', WebHookController.handleWebhook); 

export const WebhookRouter = router;