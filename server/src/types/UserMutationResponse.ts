import { Field, ObjectType } from "type-graphql";
import { User } from "../entities/User";
import { IMutationResponse } from "./MutationResponse";

@ObjectType({implements: IMutationResponse})
export class UserMutationResponse extends IMutationResponse {
    @Field({nullable: true})
    user?: User;

    @Field({nullable: true})
    accessToken?: string;

    constructor(code: number, success: boolean, message?: string, user?: User, accessToken?: string) {
        super(code, success, message);
        this.user = user;
        this.accessToken = accessToken;
    }
}
