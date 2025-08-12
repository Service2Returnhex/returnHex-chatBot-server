import ApiError from "../../utlis/AppError";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import httpStatus from 'http-status'
import bcrypt from 'bcrypt'
import { config } from "../../config/config";
import { Teacher } from "../teachers/teachers.model";
import { Student } from "../students/student.model";
//create
const createUserToDB = async (payload: IUser): Promise<any> => {
    
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser)
      throw new ApiError(httpStatus.CONFLICT, "User Already Exists");
    const hashPassword: string = await bcrypt.hash(
      payload.password,
      10
    );
    payload.password = hashPassword;
  
    const result = await User.create(payload);
    const userData = {
      name: payload.name,
      email: payload.email,
      user: result._id,
      password: payload.password,
    };
  
    if (payload.role === "teacher") {
      await Teacher.create(userData);
    } else if (payload.role === "student") {
      await Student.create(userData);
    }
  
    return result;
  };

const getAllUsersFromDB = async () => {
    const result = await User.find({isDeleted: false});
    return result
}

const getSingleUserFromDB = async(id: string): Promise<any> => {
    const result = await User.findById(id, { isDeleted: false });
    console.log(result);
  if (!result) throw new ApiError(httpStatus.NOT_FOUND, "User Not Found");
  return result;
}

const updateSingleUserToDB = async (id: string, payload: any) => {
    const isUserExists = await User.findById(id);
    if (!isUserExists) throw new ApiError(httpStatus.CONFLICT, "User Not Found!");
    const result = await User.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
    return result;
};

const softDeleteSingleUserToDB = async (id: string) => {
    const isUserExists = await User.findById(id);
    if (!isUserExists) throw new ApiError(httpStatus.CONFLICT, "User Not Found!");
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

export const UserServices = {
    createUserToDB,
    getAllUsersFromDB,
    getSingleUserFromDB,
    updateSingleUserToDB,
    softDeleteSingleUserToDB
  };