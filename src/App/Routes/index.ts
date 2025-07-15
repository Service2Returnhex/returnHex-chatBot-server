import { Router } from "express";
import { ChatgptRouter } from "../Modules/Chatgpt/chatgpt.route";
import { WebhookRouter } from "../webhook/webhook.router";

const router = Router();

const moduleRoutes = [
  {
    path: "/chatgpt",
    route: ChatgptRouter,
  },
  {
    path: "/webhook",
    route: WebhookRouter,
  },
  //   {
  //     path: "/messenger",
  //     router: MessengerRouter,
  //   },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
