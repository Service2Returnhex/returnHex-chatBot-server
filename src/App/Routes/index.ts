import { Router } from "express";
import { UserRouter } from "../Modules/User/user.route";
import { AuthRouter } from "../Modules/Auth/auth.route";

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
]

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;