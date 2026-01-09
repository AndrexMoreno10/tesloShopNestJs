import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";


@Entity({ name: 'product_images' })
export class ProductImage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    @ManyToOne(
        () => Product, // 
        (product) => product.images // esta es la relacion entre las dos tablas
        , { onDelete: 'CASCADE' } // Si se elimina el producto, se eliminan sus imagenes
        )
    product: Product

}