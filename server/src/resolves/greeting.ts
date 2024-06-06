import { Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { CheckAuth } from "../middleware/checkAuth";
import { Context } from "../types/Context";
import { User } from "../entities/User";

@Resolver()
export class GreetingResolve {
    @Query(_return => String)
    @UseMiddleware(CheckAuth)
    async hello(@Ctx() context: Context): Promise<string>  {
        const existingUser = await User.findOne({where: {id: context.user.userId}})        
        return `Hello ${existingUser ? existingUser?.username  : "World"}`
        
    }
}