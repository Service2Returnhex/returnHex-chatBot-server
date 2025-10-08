import type { SignOptions } from "jsonwebtoken";
import * as jwt from "jsonwebtoken";

type MyJwtPayload = { userId: string; role: string };

export const createToken = (jwtPayload: MyJwtPayload, secret: string, expiresIn: string | number): string => {
    const options: SignOptions = { expiresIn: "5d" };
    return (jwt as any).sign(jwtPayload, secret, options);
};

export const verifyToken = (token: string, secret: string) => {
    return (jwt as any).verify(token, secret);
};