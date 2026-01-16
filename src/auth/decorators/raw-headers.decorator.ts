import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";




export const RawHeaders = createParamDecorator(

    (data, ctx: ExecutionContext) => {

        const req = ctx.switchToHttp().getRequest(); // obtenemos el request
        return req.rawHeaders; // obtenemos los raw headers del request 
    }

)