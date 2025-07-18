import express from  'express'
import { UserController } from './user.controller';
import { validateRequest } from '../../utility/validateRequest';
import { UserValidations } from './user.validation';
const router = express.Router();

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getOneUser);

router.post('/create-user', 
    validateRequest(UserValidations.createUserValidationSchema),
    UserController.createUser
);

router.patch('/update-user/:id', UserController.updatOneUser);

export const UserRouter = router;