import { Router } from "express";
import { AuthRouter } from "../Modules/Auth/auth.route";
import { ChatgptRouter } from "../Modules/Chatgpt/chatgpt.route";
import { MessengerRouter } from "../Modules/Messenger/messenger.route";
import { UserRouter } from "../Modules/User/user.route";
import { WebhookRouter } from "../webhook/webhook.router";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRouter,
  },
  {
    path: "/users",
    route: UserRouter,
  },
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
