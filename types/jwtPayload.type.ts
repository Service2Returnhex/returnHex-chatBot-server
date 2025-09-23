export type JwtPayload = {
  userId?: string;
  _id?: string;
  id?: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
};