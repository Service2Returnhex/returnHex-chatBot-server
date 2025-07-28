"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const validateRequest_1 = require("../../utility/validateRequest");
const user_validation_1 = require("./user.validation");
const router = express_1.default.Router();
router.get('/', user_controller_1.UserController.getAllUsers);
router.get('/:id', user_controller_1.UserController.getOneUser);
router.post('/create-user', (0, validateRequest_1.validateRequest)(user_validation_1.UserValidations.createUserValidationSchema), user_controller_1.UserController.createUser);
router.patch('/update-user/:id', user_controller_1.UserController.updatOneUser);
exports.UserRouter = router;
