import { Types } from "mongoose";
import { Admin } from "../Modules/Admin/admin.model";
import { Doctor } from "../Modules/Doctor/doctor.model";
import { Patients } from "../Modules/Patients/patients.model";
import { Staff } from "../Modules/Staff/staff.model";
import { IUser } from "../Modules/User/user.interface";


type TUserData = {
    name: string,
    email: string,
    user: Types.ObjectId,
  };

export const createDataByRole = async (payload: IUser, userData: TUserData) => {
    if (payload.role === "staff") {
        await Staff.create(userData);
      } else if (payload.role === "doctor") {
        console.log('coming here');
        await Doctor.create(userData);
      } else if (payload.role === 'admin') {
        await Admin.create(userData);
      } else if (payload.role === 'patients') {
        await Patients.create(userData);
      }
}