import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto copy';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) { }


  async create(createUserDto: CreateUserDto) {

    try {

      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10) // cifra la contraseña con bcrypt 
      });

      await this.userRepository.save(user);
      delete user.password; // elimina la contraseña del objeto user antes de retornarlo

      return {
        ...user,
        token: this.getJwtToken({ id: user.id }) // genera el token JWT
      }

    } catch (error) {
      this.handleDBErrors(error);
    }

  }

  async login(loginUserDto: LoginUserDto) {

    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({

      where: { email },
      select: { email: true, password: true, id: true } // selecciona solo los campos email, password e id
    })

    if (!user)
      throw new BadRequestException('Credentials are not valid (id)');

    if (!bcrypt.compareSync(password, user.password)) // compara la contraseña ingresada con la almacenada 
      throw new BadRequestException('Credentials are not valid (password)');


    return {
      ...user, // retorna el usuario sin la contraseña
      token: this.getJwtToken({ id: user.id }) // genera el token JWT
    };
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }) // genera el token JWT
    };

  }


  private getJwtToken(payload: JwtPayload) {

    const token = this.jwtService.sign(payload); // genera el token JWT
    return token;

  }

  private handleDBErrors(error: any): never { // never indica que esta función no retorna nada, solo lanza errores

    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    console.log(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');

  }

}
