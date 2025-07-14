import {z} from 'zod';

const createUserValidationSchema = z.object({
    body: z.object({
        name: z.string({message: "Name is required"}),
        email: z.string({message: "Email is required"}).email({message: "Invalid email address"}),
        password: z.string({message: "Password is required"}).max(15, {message: "Password should not be greated than 15 character"}),
        role: z.enum(["admin", "doctor", "patient", "staff"], {message: "Role is Required"}),
        status: z.enum(['in-progress', 'blocked'], {message: "Status is required"}).default(('in-progress')),
        isDeleted: z.boolean({message: "isDelete is required"}).default(false),
    })
})

export const UserValidations = {
    createUserValidationSchema
}