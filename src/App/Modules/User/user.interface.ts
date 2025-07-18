import USER_ROLE from "../../constants/userRole"

export interface IUser {
    email: string
    password: string
    name: string
    image?: string
    role: "admin" | "doctor" | "patient" | "staff"
    status: 'in-progress' | 'blocked'
    isDeleted: boolean
}

export type TUserRole = keyof typeof USER_ROLE 