import { Field, InterfaceType } from "type-graphql";

@InterfaceType()
export abstract class IMutationResponse {
    @Field()
    code: number;

    @Field()
    success: boolean;
    
    @Field({nullable: true})
    message?: string;

    constructor(code: number, success: boolean, message?: string) {
        this.code = code;
        this.success = success;
        this.message = message;
    }
}
