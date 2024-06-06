import { AuthenticationError } from "apollo-server-core";
import { Secret, verify } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";
import { Context } from "../types/Context";
import { UserAuthPayload } from "../types/UserAuthPayload";

export const CheckAuth: MiddlewareFn<Context> = ({ context, info }, next) => {    
    try {
        const authHeader = context.req.header("Authorization");
        const accessToken = authHeader && authHeader.split(" ")[1];
        if(!accessToken) {
            throw new AuthenticationError("Not authenticated to perform GraphQl operations")
        }

        const decodedUser = verify(accessToken, process.env.ACCESS_TOKEN_SECRET as Secret) as UserAuthPayload // & này để and thêm cái userId này vào nó luôn bởi JwtPayload chỉ có iat và epx thôi, không phải add nha

        context.user = decodedUser // cái này sẽ lấy ra ở greeting kiểu gì? @Ctx

        return next();
    } catch (error) {
        throw new AuthenticationError("Error authenticating  user"+JSON.stringify(error))
    }


  };