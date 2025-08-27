import USER_ROLE from "../../constants/userRole"

export interface IUser {
  name: string
  email: string
  contact?: string
  address?:string
  password: string
  image?: string
  role: "admin" | "user"
  status: 'in-progress' | 'blocked'
  isDeleted: boolean
}

export type TUserRole = keyof typeof USER_ROLE
