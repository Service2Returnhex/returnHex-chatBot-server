import { Router } from "express";
import { UserRouter } from "../Modules/User/user.route";
import { AuthRouter } from "../Modules/Auth/auth.route";
import { ChatgptRouter } from "../Modules/Chatgpt/chatgpt.route";

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
    }
]

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;