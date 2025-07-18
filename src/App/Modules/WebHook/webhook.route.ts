import express from 'express';
import { WebHookController } from './webhook.controller';
const router = express.Router();

//verification
router.get('/', WebHookController.handleWebhook); 

//receive messages
router.post('/', WebHookController.handleIncomingMessages); 


export const WebhookRouter = router;