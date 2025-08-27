import { IUser } from "./user.interface";
import { User } from "./user.model";
import httpStatus from 'http-status'
import bcrypt from 'bcrypt'
import ApiError from "../../utility/AppError";
//create
const createUserToDB = async (payload: IUser): Promise<IUser> => { 
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser)
      throw new ApiError(httpStatus.CONFLICT, "User Already Exists");
    const hashPassword: string = await bcrypt.hash(
      payload.password,
      10
    );
    payload.password = hashPassword;
    const result = await User.create(payload)
    return result;
};

const getAllUsersFromDB = async (status?: string) => {
    let result = null;
    if(status === 'blocked') {
      result = await User.find({isDeleted: true})
    }
    else if(status === undefined || status === 'all')
    {
      result = await User.find();
    }
    else throw new ApiError(httpStatus.NOT_FOUND, "API Not Found!")
    return result
}

const getSingleUserFromDB = async(id: string): Promise<any> => {
    const result = await User.findById(id);
    console.log(result);
  if (!result) throw new ApiError(httpStatus.NOT_FOUND, "User Not Found");
  return result;
}

const updateSingleUserToDB = async (id: string, payload: Partial<IUser>) => {
    const isUserExists = await User.findById(id);
    if (!isUserExists) throw new ApiError(httpStatus.NOT_FOUND, "User Not Found!");
    const result = await User.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
    return result;
};

const softDeleteSingleUserToDB = async (id: string) => {
    const isUserExists = await User.findById(id);
    if (!isUserExists) throw new ApiError(httpStatus.NOT_FOUND, "User Not Found!");
    if(isUserExists.isDeleted) throw new ApiError(httpStatus.NOT_ACCEPTABLE, "User Already Deleted")
    const result = await User.findByIdAndUpdate(
      id,
      { isDeleted: true, status: "blocked" },
      {
        new: true,
        runValidators: true,
      }
    );
    return result;
};

const restoreSingleUserFromDB = async (id: string) => {
  const isUserExists = await User.findById(id);
  if (!isUserExists) throw new ApiError(httpStatus.NOT_FOUND, "User Not Found!");
  const result = await User.findByIdAndUpdate(
    id,
    {isDeleted: false, status: 'in-progress'},
    {
      new: true,
      runValidators: true,
    }
  )
  return result;
}

export const UserServices = {
    createUserToDB,
    getAllUsersFromDB,
    getSingleUserFromDB,
    updateSingleUserToDB,
    softDeleteSingleUserToDB,
    restoreSingleUserFromDB
  };