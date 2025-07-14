import { Router } from "express";
import { UserRouter } from "../Modules/User/user.route";
import { AuthRouter } from "../Modules/Auth/auth.route";
import { ChatgptRouter } from "../Modules/Chatgpt/chatgpt.route";
import { GeminiRouter } from "../Modules/Gemini/gemini.route";

const router = Router();

const moduleRoutes = [
    {
        path: '/auth',
        route: AuthRouter
    }
    ,
    {
        path: '/users',
        route: UserRouter
    },
    {
        path: '/chatgpt',
        route: ChatgptRouter
    },
    {
        path: '/gemini',
        route: GeminiRouter
    },
]

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;