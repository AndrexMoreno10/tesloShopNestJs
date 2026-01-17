// simulamos la tabla product 
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'products' })
export class Product {


    @ApiProperty({
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        description: 'Product ID',
        uniqueItems: true, // indica que es unico
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-Shirt Teslo',
        description: 'Product Title',
        uniqueItems: true, // indica que es unico
    })
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty({
        example: 0,
        description: 'Product price',
        default: 0,
    })
    @Column('float', {
        default: 0,
    })
    price: number;

    @ApiProperty({
        example: 'lorem ipsum dolor sit amet',
        description: 'Product description',
        default: null,
    })
    @Column({
        type: 'text',
        nullable: true, // puede aceptar nulo
    })
    description?: string;

    @ApiProperty({
        example: 't-shirt-teslo',
        description: 'Product Slug - for SEO',
        uniqueItems: true, // indica que es unico
    })
    @Column('text', {
        unique: true,
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 0,
    })
    @Column('int', {
        default: 0,
    })
    stock: number;

    @ApiProperty({
        example: ['M', 'L', 'XL'],
        description: 'Product sizes',
    })
    @Column('text', {
        array: true, // indica que es un arreglo  
    })
    sizes: string[];

    @ApiProperty({
        example: 'women',
        description: 'Product gender',
        uniqueItems: true, // indica que es unico
    })
    @Column('text')
    gender: string;

    @ApiProperty()
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @ApiProperty()
    @OneToMany(
        () => ProductImage, // va regresar un productImage
        (productImage) => productImage.product, // esta es la relacion entre las dos tablas
        { cascade: true, eager: true }
    )
    images?: ProductImage[];


    @ManyToOne(
        () => User, // va regresar un usuario
        (user) => user.product, // esta es la relacion entre las dos tablas
        { eager: true } // carga el usuario automaticamente cuando se carga el producto

    )
    user: User;



    @BeforeInsert()
    checkSlugInsert() {

        if (!this.slug) {
            this.slug = this.title;
        }
        this.slug = this.slug
            .toLowerCase()
            .replace(' ', '_') // reemplaza espacios por guiones bajos
            .replaceAll("'", ''); // elimina comillas simples
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
            .toLowerCase()
            .replace(' ', '_') // reemplaza espacios por guiones bajos
            .replaceAll("'", ''); // elimina comillas simples
    }

}

