import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { RegisterInput } from "../types/RegisterInput";
import { User } from "../entities/User";
import argon2 from "argon2";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { LoginInput } from "../types/LoginInput";
import { createToken, sendRefreshToken } from "../utils/auth";
import { Context } from "../types/Context";

@Resolver((_return) => UserMutationResponse)
export class UserResolver {
    @Query(_return => [User]) // kiểu trả về của graphql 
    // kiểu trả về của ts
    async users(): Promise<User[]> {
        return await User.find({})
    }

    @Mutation(_return => UserMutationResponse)
    async register(
        @Arg("registerInput") // đăng kí cái registerInput này với cái server của chúng ta
        registerInput: RegisterInput
    ): Promise<UserMutationResponse> {
        const {username, password} = registerInput

        const existingUser = await User.findOne({where: {username: username}})
        if(existingUser) {
            return {
                code: 400,
                success: false,
                message: "Duplicate username"
            }
        }
        const hashedPassword = await argon2.hash(password)

        const newUser = User.create({
            username,
            password: hashedPassword
        })
        await newUser.save()
        return {
            code: 200,
            success: true,
            message: "User registration successful",
            user: newUser
        }
    }

    @Mutation(_return => UserMutationResponse)
    async login(
        @Arg("loginInput") {username, password}: LoginInput, @Ctx() {res}: Context
    ): Promise<UserMutationResponse> {
        const existingUser = await User.findOne({where: {username}})
        if(!existingUser) {
            return {
                code: 400,
                success: false,
                message: 'User not found'
            }
        }

        const isPasswordValid = await argon2.verify(existingUser.password, password)
        if(!isPasswordValid) {
            return {
                code: 400,
                success: false,
                message: "Incorrect password"
            }
        }

        sendRefreshToken(res, existingUser)

        return {
            code: 200,
            success: true,
            message: "Login successfully",
            user: existingUser,
            accessToken: createToken('accessToken',existingUser)
        }
    }
}

