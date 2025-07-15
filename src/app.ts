import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import router from './App/Routes';
import { globalErrorHanlder } from './App/Middlewares/globalErrorHandler';
import notFound from './App/Middlewares/notFound';
import cookieParser from 'cookie-parser';
import { GeminiService, replyToComment, sendMessage } from "./App/Modules/Gemini/gemini.service"
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

app.use("/api/v1", router);

app.get('/', (req, res) => {
    res.send("Hello Server");
})

const VERIFY_TOKEN = "myrandomverifytokenforfacebookpage";

// Verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Receiving Messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const event = entry.messaging?.[0];

      if (event?.message) {
        const senderId = event.sender.id;
        const userMsg = event.message.text;
        const reply = await GeminiService.getResponse(userMsg);

        await sendMessage(senderId, reply as string);
      }
    }

    // For comments (feed event)
    for (const entry of body.entry) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field === 'feed' && change.value.comment_id) {
          const commentId = change.value.comment_id;
          const commentMessage = change.value.message;
          const reply = await GeminiService.getResponse(commentMessage);
          await replyToComment(commentId, reply as string);
        }
      }
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.use(notFound);
app.use(globalErrorHanlder);

export default app;