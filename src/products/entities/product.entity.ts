// simulamos la tabla product 
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";

@Entity({ name: 'products' }) 
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    title: string;

    @Column('float', {
        default: 0,
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true, // puede aceptar nulo
    })
    description?: string;

    @Column('text', {
        unique: true,
    })
    slug: string;

    @Column('int', {
        default: 0,
    })
    stock: number;

    @Column('text', {
        array: true, // indica que es un arreglo  
    })
    sizes: string[];

    @Column('text')
    gender: string;

    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @OneToMany(
        () => ProductImage, // va regresar un productImage
        (productImage) => productImage.product, // esta es la relacion entre las dos tablas
        {cascade: true, eager: true}
    )
    images?: ProductImage[];


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

