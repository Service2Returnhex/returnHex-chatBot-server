// routes/user.route.ts
import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router();

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getOneUser);

router.post('/create-user', UserController.createUser);
router.patch('/update-user/:id', UserController.updateOneUser);
router.delete('/remove-user/:id', UserController.softDeleteUser);
router.patch('/restore-user/:id', UserController.restoreOneUser);

export const userRouter = router;
