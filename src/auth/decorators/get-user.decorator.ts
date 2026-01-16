import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";




export const GetUser = createParamDecorator(

    (data, ctx: ExecutionContext) => {

        const req = ctx.switchToHttp().getRequest(); // obtenemos el request
        const user = req.user; // obtenemos el usuario del request

        if (!user)
            throw new InternalServerErrorException('User not found - make sure that the AuthGuard is used before GetUser Decorator');

        return (!data) ? user : user[data]; // si no existe la data, retornamos el usuario completo, si existe, retornamos la propiedad especifica
    }

)