import { Response } from "express";
import { User } from "../entities/User";
import { Secret, sign } from "jsonwebtoken";

export const createToken = (type: "accessToken" | "refreshToken", user: User) => {
  return sign(
    {
      userId: user.id,
    },
    type === "accessToken" 
    ? 
    process.env.ACCESS_TOKEN_SECRET as Secret
    : 
    process.env.REFRESH_TOKEN_SECRET as Secret,
    {
        expiresIn: type === 'accessToken' ? '20s' : '60m'
    }
  );
};

export const sendRefreshToken = (res: Response, user: User) => {
  res.cookie(process.env.REFRESH_TOKEN as string, createToken('refreshToken', user), {
    sameSite: 'lax',
    httpOnly: true,
    secure: true,
    path: '/refresh_token'// bảo với frontend gởi tới backend localhost:4000/refresh_token chỉ đính kèm token lên cái đường dẫn này thôi 
})
}