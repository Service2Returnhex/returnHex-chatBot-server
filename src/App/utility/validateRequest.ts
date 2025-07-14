import { AnyZodObject, ZodError } from "zod";
import { catchAsync } from "./cathcAsync";
import { NextFunction, Request, Response } from "express";
import sendResponse from "./sendResponse";
import httpStatus from 'http-status'

export const validateRequest = (schema: AnyZodObject) => {
    return async(req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({body: req.body, cookies: req.cookies})
            return next();
        } catch (error) {
            if(error instanceof ZodError) {
                const messages = error.errors.map(err => err.message);
                return sendResponse(res, {
                    statusCode: httpStatus.BAD_REQUEST,
                    success: false,
                    message: "Bad Rquest",
                    data : messages
                })
            }
        }
    }
}