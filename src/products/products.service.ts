import { Inject, Injectable, InternalServerErrorException, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';

import { PaginationDto } from '../common/dtos/pagination.dto';
// import { validate as isUUID } from 'uuid'
import isUUID from 'validator/lib/isUUID';
import { ProductImage } from './entities/product-image.entity';
import { User } from 'src/auth/entities/user.entity';


@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService'); // Logger para el servicio de productos

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource, // Inyectamos el DataSource para manejar transacciones - para crear mi queryRunner

  ) {

  }

  async create(createProductDto: CreateProductDto, user: User) {

    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({ url: image })), // Mapeamos las imagenes para crear instancias de ProductImage
        user, // Asociamos el usuario que crea el producto
      });
      await this.productRepository.save(product);
      return { ...product, images };

    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find(
      {
        take: limit,
        skip: offset,
        relations: {
          images: true
        }
      });

    return products.map((product) => ({
      ...product,
      images: product.images.map(img => img.url)

    }))
  }

  async findOne(term: string) {

    let product: Product | null;
    // const product = await this.productRepository.findOneBy({ term });

    if (isUUID(term)) {

      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', { // Contruir query para buscar por title o slug
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages') // Hacemos un left join para traer las imagenes relacionadas
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`Product with term ${term} not found`);

    return product;
  }

  // Metodo para devolver un producto en formato plano (sin relaciones complejas)
  // Usado para devolver un producto por su termino de busqueda (termino puede ser id, slug o title)
  // En este metodo solo devolvemos las urls de las imagenes en lugar de todo el objeto de imagen
  async findOnePlain(term: string) {

    const { images = [], ...product } = await this.findOne(term); // Usamos destructuring para separar las imagenes del producto
    return {
      ...product, // Spread operator para devolver todas las propiedades del producto
      images: images.map(image => image.url) // Solo devolvemos las urls de las imagenes
    }
  }


  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...toUpdate } = updateProductDto;

    //Preparamos para actiualizar el producto
    const product = await this.productRepository.preload({
      id: id, // id del producto a actualizar
      ...toUpdate // spread operator para las propiedades a actualizar
    });

    if (!product) throw new NotFoundException(`Product with id ${id} not found`);

    //Create QueryRunner
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect(); // Conectamos el queryRunner a la base de datos
    await queryRunner.startTransaction(); // Iniciamos la transaccion

    try {

      if (images) {
        // Si hay imagenes para actualizar, primero borramos las imagenes existentes o anteriores
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        // Luego, creamos las nuevas imagenes
        product.images = images.map(
          image => this.productImageRepository.create({ url: image })
        );
      }
      product.user = user; // Actualizamos el usuario que hizo la modificacion

      await queryRunner.manager.save(product); // Guardamos el producto actualizado usando el queryRunner
      await queryRunner.commitTransaction(); // Hacemos commit de la transaccion
      await queryRunner.release(); // Liberamos el queryRunner
      return this.findOnePlain(id); // Devolvemos el producto actualizado en formato plano

    } catch (error) {
      await queryRunner.rollbackTransaction(); // Si hay un error, hacemos rollback de la transaccion
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {

    const product = await this.productRepository.findOneBy({ id });

    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    await this.productRepository.remove(product);
    return { message: `Product with id ${id} has been removed` };
  }

  private handleDBExceptions(error: any) {

    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    // console.log(error);
    throw new InternalServerErrorException('Error creating product - Check server logs');
  }

  async deleteAllProducts() {

    const query = this.productRepository.createQueryBuilder('product'); // Crear un query builder para la entidad Product

    try {
      return await query
        .delete() // Indicar que es una operacion de borrado
        .where({}) // Sin condiciones, para borrar todos los registros
        .execute(); // Ejecutar el query
    } catch (error) {
      this.handleDBExceptions(error);
    }


  }



}
