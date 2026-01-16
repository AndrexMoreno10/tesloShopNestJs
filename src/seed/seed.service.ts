import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
  }

  async executedSeed() {
    await this.deleteTables();

    const adminUser = await this.insertUsers();

    await this.insertNewProducts(adminUser);

    return `Seed Executed`;
  }

  private async insertUsers() {

    const seedUsers = initialData.users; // trae los usuarios del archivo seed-data.ts
    const users: User[] = []; // array para almacenar las instancias de User 

    seedUsers.forEach(user => {
      users.push(this.userRepository.create(user)); // crea una instancia de User y la agrega al array
    });

    const dbUsers = await this.userRepository.save(seedUsers); // guarda todas las instancias en la base de datos
    return dbUsers[0]; // retorna el primer usuario creado
  }


  private async deleteTables() {

    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder(); // crea un query builder para la entidad User
    await queryBuilder
      .delete()
      .where({}) // sin condiciones, elimina todos los registros
      .execute();

  }

  private async insertNewProducts(user: User) {

    await this.productsService.deleteAllProducts();

    const products = initialData.products; //trae los productos del archivo seed-data.ts - parecido al DTO O entidad

    const insertPromises = [];

    products.forEach(product => {
      insertPromises.push(this.productsService.create(product , user)); //almacena la promesa en el array insertPromises
    });

    const results = await Promise.all(insertPromises); // espera a que todas las promesas se resuelvan

    return true
  }

}
