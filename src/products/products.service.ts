import { Inject, Injectable, InternalServerErrorException, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

import { PaginationDto } from '../common/dtos/pagination.dto';
// import { validate as isUUID } from 'uuid'
import isUUID from 'validator/lib/isUUID';


@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService'); // Logger para el servicio de productos

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {

  }

  async create(createProductDto: CreateProductDto) {

    try {

      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;

    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

  findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    return this.productRepository.find(
      {
        take: limit,
        skip: offset,
      }
    );
  }

  async findOne(term: string) {

    let product: Product | null;
    // const product = await this.productRepository.findOneBy({ term });

    if (isUUID(term)) {

      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', { // Contruir query para buscar por title o slug
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        }).getOne();
    }

    if (!product)
      throw new NotFoundException(`Product with term ${term} not found`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    //Preparamos para actiualizar el producto
    const product = await this.productRepository.preload({
      id: id, // id del producto a actualizar
      ...updateProductDto, // spread operator para las propiedades a actualizar
    });

    if (!product) throw new NotFoundException(`Product with id ${id} not found`);

    try {

      await this.productRepository.save(product);
      return product;

    } catch (error) {
      this.handleDBExceptions(error);
    }

    return `This action updates a #${id} product`;
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
}
