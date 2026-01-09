import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService
  ) {
  }
  
  async executedSeed() {
    await this.insertNewProducts();
    return `Seed Executed`;
  }

  private async insertNewProducts() {
  
   await this.productsService.deleteAllProducts();

    const products = initialData.products; //trae los productos del archivo seed-data.ts - parecido al DTO O entidad

    const insertPromises = [];

    products.forEach( product => {
      insertPromises.push( this.productsService.create(product)); //almacena la promesa en el array insertPromises
    });
   
    const results = await Promise.all( insertPromises ); // espera a que todas las promesas se resuelvan
    
    return true
  }

}
