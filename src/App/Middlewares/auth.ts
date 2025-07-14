import { JwtPayload } from "jsonwebtoken"
import { config } from "../config/config"
import { verifyToken } from "../Modules/Auth/auth.utils"
import { TUserRole } from "../Modules/User/user.interface"
import { User } from "../Modules/User/user.model"
import ApiError from "../utility/AppError"
import { catchAsync } from "../utility/cathcAsync"
import httpStatus from 'http-status' 

const auth = (...requireRoles: TUserRole[]) => {
    return catchAsync(
        async(req, res, next) => {
            const token = req.headers.authorization

            if(!token) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "Token Not Found. Unauthorized user!");
            }

            let decoded; //payload will be reserved
            try {
                decoded = verifyToken(token, config.jwt_access_secret as string);
            } catch (error) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "Could not verify token. Unauthorized user")
            }
            const { userId , role } = decoded as JwtPayload;
            const user = await User.findById(userId);
            if(!user) {
                throw new ApiError(httpStatus.NOT_FOUND, "User Not Found!");
            }
            if(user.isDeleted) {
                throw new ApiError(httpStatus.NOT_FOUND, "User is deleted");
            }
            if(user.status == 'blocked') {
                throw new ApiError(httpStatus.NOT_FOUND, "User is blocked");
            }
            if(requireRoles && !requireRoles.includes(role)) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "Role mismatched. Unauthorized!");
            }

            req.user = decoded as JwtPayload
            next();
        }
    )
}

export default auth;