import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector,

  ) { }


  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler()); // Obtenemos los roles permitidos de los metadatos     

    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest(); // Obtenemos el usuario de la request
    const user = req.user as User; // Usuario autenticado

    if (!user) {
      throw new BadRequestException('Usuario no existe o no esta autenticado');
    }

    for (const role of user.roles) { // Iteramos sobre los roles del usuario
      if (validRoles.includes(role)) { // Si el rol del usuario esta en los roles permitidos
        return true; // Permitimos el acceso
      }
    }

    throw new ForbiddenException(
      `User ${user.fullname} need a valid role: ${validRoles}`,
    ) // Si no tiene un rol valido, lanzamos una excepcion
  };
}
