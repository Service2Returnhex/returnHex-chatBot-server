import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import notFound from "./App/Middlewares/NotFound";
import { globalErrorHanlder } from "./App/Middlewares/globalErrorHandler";
import router from "./App/Routes";
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.send("Hello Server");
});

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Verification
// app.get('/webhook', (req, res) => {
//   const mode = req.query['hub.mode'];
//   const token = req.query['hub.verify_token'];
//   const challenge = req.query['hub.challenge'];

//   if (mode === 'subscribe' && token === VERIFY_TOKEN) {
//     console.log("Webhook verified!");
//     res.status(200).send(challenge);
//   } else {
//     res.sendStatus(403);
//   }
// });

// Receiving Messages
// app.post('/webhook', async (req, res) => {
//   console.log('📥 RAW WEBHOOK:', JSON.stringify(req.body, null, 2)); // Debug raw payload

//   if (req.body.object === 'page') {
//     try {
//       for (const entry of req.body.entry) {
//         // Handle messages (DM)
//         const event = entry.messaging?.[0];
//         if (event?.message) {
//           const senderId = event.sender.id;
//           const userMsg = event.message.text;
//           console.log('💬 DM Message:', userMsg);
//           const reply = await GeminiService.getResponse(userMsg);
//           await GeminiService.sendMessage(senderId, reply as string);
//         }

//         // Handle comments
//         const changes = entry.changes || [];
//         for (const change of changes) {
//           if (change.field === 'feed' && change.value.item === 'comment') {
//             const commentData = change.value;
//             console.log('💬 Comment Data:', JSON.stringify(commentData, null, 2));

//             if (commentData.verb === 'add') {
//               const commentId = commentData.comment_id;
//               const commentMsg = commentData.message;
//               const reply = await GeminiService.getResponse(commentMsg);
//               await GeminiService.replyToComment(commentId, reply as string);
//             }
//           }
//         }
//       }
//     } catch (err) {
//       console.error('❌ Webhook Error:', err);
//     }
//     res.sendStatus(200);
//   } else {
//     res.sendStatus(404);
//   }
// });

app.use(notFound);
app.use(globalErrorHanlder);

export default app;
