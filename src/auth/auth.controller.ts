import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto copy';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { RawHeaders, GetUser, Auth } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }


  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User,
  ) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    // @Req() request: Express.Request
    @GetUser() user: User, // Usamos el decorador personalizado para obtener el usuario
    @GetUser('email') userEmail: string, // Usamos el decorador personalizado para obtener el email del usuario

    @RawHeaders() rawHeaders: string[],

  ) {

    return {
      ok: true,
      message: 'Hola Mundo Private',
      user: user,
      userEmail: userEmail
    }
  }

  //SetMetadata nos permite establecer informacion personalizada en la ruta
  // @SetMetadata('roles', ['admin', 'super-user']) // Establecemos los roles permitidos para esta ruta - 
  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin) // Usamos el decorador personalizado para establecer los roles permitidos
  @UseGuards(AuthGuard(), UserRoleGuard) // Protegemos la ruta con el guard de autenticación
  privateRoute2(
    @GetUser() user: User,
  ) {

    return {
      ok: true,
      message: 'Hola Mundo Private 2',
      user
    }
  }

  @Get('private3')
  @Auth(ValidRoles.admin) // Usamos el decorador personalizado para establecer los roles permitidos
  privateRoute3(
    @GetUser() user: User,
  ) {

    return {
      ok: true,
      message: 'Hola Mundo Private 3',
      user
    }
  }




}
