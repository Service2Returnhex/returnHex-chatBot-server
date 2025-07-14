import { Request } from "express";
import { User } from "./user.model";
import bycrypt from "bcrypt";
import { IUser } from "./user.interface";
import ApiError from "../../utility/AppError";
import httpStatus from "http-status";
import { config } from "../../config/config";


//create
const createUserToDB = async (payload: IUser): Promise<any> => {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser)
    throw new ApiError(httpStatus.CONFLICT, "User Already Exists");
  const hashPassword: string = await bycrypt.hash(
    payload.password,
    Number(config.soltRound)
  );
  payload.password = hashPassword;

  const result = await User.create(payload);
  const userData = {
    name: payload.name,
    email: payload.email,
    user: result._id,
  };

  // createDataByRole(payload, userData);
  // if (payload.role === "staff") {
  //   await Staff.create(userData);
  // } else if (payload.role === "doctor") {
  //   await Doctor.create(userData);
  // } else if (payload.role === "admin") {
  //   await Admin.create(userData);
  // } else if (payload.role === "patient") {
  //   await Patients.create(userData);
  // } else {
  //   throw new Error("NO Role Matched");
  // }

  return result;
};

//read
const getAllUsersFromDB = async () => {
  const result = await User.find({ isDeleted: false });
  return result;
};

const getOneUserFromDB = async (id: string) => {
  const result = await User.findById(id, { isDeleted: false });
  if (!result) throw new ApiError(httpStatus.NOT_FOUND, "User Not Found");
  return result;
};

const getUserByEmail = async (email: string) => {
  const result = await User.findOne({ email: email });
  return result;
};

//update
const updateOneUserToDB = async (id: string, payload: any) => {
  const isUserExists = await User.findById(id);
  if (!isUserExists) throw new ApiError(409, "User Not Found!");
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

export const UserServices = {
  createUserToDB,
  getOneUserFromDB,
  getAllUsersFromDB,
  getUserByEmail,
  updateOneUserToDB,
};
