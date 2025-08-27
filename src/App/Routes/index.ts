import { Router } from "express";
import { ChatgptRouter } from "../Modules/Chatgpt/chatgpt.route";
import { GeminiRouter } from "../Modules/Gemini/gemini.route";
import { WebhookRouter } from "../Modules/WebHook/webhook.route";
import { PageRouter } from "../Modules/Page/page.route";
import { DeepSeekRouter } from "../Modules/DeepSeek/deepseek.route";
import { GroqRouter } from "../Modules/Groq/grok.route";
import { authRoute } from "../Modules/auth/auth.route";
import { userRouter } from "../Modules/users/user.route";

const router = Router();

const moduleRoutes = [
    {
        path: '/auth',
        route: authRoute
    },
    {
        path: '/users',
        route: userRouter
    },
    {
        path: '/meta-webhook', 
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
        path: '/deepseek',
        route: DeepSeekRouter
    },
    {
        path: '/groq',
        route: GroqRouter
    },
    {
        path: '/page',
        route: PageRouter
    }
]

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;