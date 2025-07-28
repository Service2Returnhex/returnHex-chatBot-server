"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidations = void 0;
const zod_1 = require("zod");
const createUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ message: "Name is required" }),
        email: zod_1.z.string({ message: "Email is required" }).email({ message: "Invalid email address" }),
        password: zod_1.z.string({ message: "Password is required" }).max(15, { message: "Password should not be greated than 15 character" }),
        role: zod_1.z.enum(["admin", "doctor", "patient", "staff"], { message: "Role is Required" }),
        status: zod_1.z.enum(['in-progress', 'blocked'], { message: "Status is required" }).default(('in-progress')),
        isDeleted: zod_1.z.boolean({ message: "isDelete is required" }).default(false),
    })
});
exports.UserValidations = {
    createUserValidationSchema
};
