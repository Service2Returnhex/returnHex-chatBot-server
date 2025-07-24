import { Router } from "express";
import { AuthRouter } from "../Modules/Auth/auth.route";
import { ChatgptRouter } from "../Modules/Chatgpt/chatgpt.route";
import { DeepSeekRouter } from "../Modules/Deepseek/deepseek.route";
import { GeminiRouter } from "../Modules/Gemini/gemini.route";
import { GorkRouter } from "../Modules/Grok/grok.router";
import { PageRouter } from "../Modules/Page/page.route";
import { UserRouter } from "../Modules/User/user.route";
import { WebhookRouter } from "../Modules/WebHook/webhook.route";

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
    path: "/webhook",
    route: WebhookRouter,
  },
  {
    path: "/chatgpt",
    route: ChatgptRouter,
  },
  {
    path: "/gemini",
    route: GeminiRouter,
  },
  {
    path: "/grok",
    route: GorkRouter,
  },
  {
    path: "/deepseek",
    route: DeepSeekRouter,
  },
  {
    path: "/page",
    route: PageRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
