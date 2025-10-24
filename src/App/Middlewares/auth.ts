import { JwtPayload } from 'jsonwebtoken'
import { config } from "../config/config";
import httpStatus from 'http-status'
import { verifyToken } from '../Modules/auth/auth.utils';
import { TUserRole } from '../Modules/users/user.interface';
import { catchAsync } from '../utility/cathcAsync';
import { Request, Response, NextFunction } from 'express';
import ApiError from '../utility/AppError';
import { User } from '../Modules/users/user.model';

const auth = (...requireRoles: TUserRole[]) => {
    return catchAsync(
        async(req: Request, res: Response, next: NextFunction) => {
            const token = req.headers.authorization
            if(!token) throw new ApiError(httpStatus.UNAUTHORIZED, "Token Not Found. Unauthorized user!");
            const decoded = verifyToken(token, config.jwt_access_secret as string) as JwtPayload;
            
            if(!decoded) throw new ApiError(httpStatus.UNAUTHORIZED, "Could not verify token. Unauthorized user");
            const {userId, role} = decoded

            const user = await User.findById(userId);
            if(!user) throw new ApiError(httpStatus.NOT_FOUND, "User Not Found!");
            if(user.isDeleted) throw new ApiError(httpStatus.NOT_FOUND, "User is deleted");
            if(user.status == 'blocked') throw new ApiError(httpStatus.NOT_FOUND, "User is blocked");
            if(requireRoles && !requireRoles.includes(role)) 
                throw new ApiError(httpStatus.UNAUTHORIZED, "Role mismatched. Unauthorized!");

            req.user = decoded as JwtPayload

            next();
        }
    )
}

export default auth;