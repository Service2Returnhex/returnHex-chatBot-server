import { Router } from "express";
import { ChatgptRouter } from "../Modules/Chatgpt/chatgpt.route";
import { GeminiRouter } from "../Modules/Gemini/gemini.route";
import { WebhookRouter } from "../Modules/WebHook/webhook.route";
import { PageRouter } from "../Modules/Page/page.route";

const router = Router();

const moduleRoutes = [
    {
        path: '/webhook', 
        route: WebhookRouter 
    },
    {
        path: '/chatgpt',
        route: ChatgptRouter
    },
    {
        path: '/gemini',
        route: GeminiRouter
    },
    {
        path: '/page',
        route: PageRouter
    }
]

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;