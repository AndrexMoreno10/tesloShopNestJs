import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ 
        unique: true,
    })
    email: string;

    @Column('text',{
        select: false, // no devolver el campo password en las consultas por defecto
    })
    password: string;


    @Column('text')
    fullname: string;

    @Column('bool',{ 
        default: true,
    })
    isActive: boolean;

    @Column('text',{
        array: true,
        default: ['user'],
    })
    roles: string[];

    @OneToMany(
        () => Product, // va regresar un producto
        (product) => product.user, // esta es la relacion entre las dos tablas
        // {cascade: true, eager: true} // carga automatica de los productos del usuario 
    )
    product: Product



    @BeforeInsert()
    checkFieldsBeforeInsert(){
        this.email = this.email.toLowerCase().trim(); // limpia el email a minusculas y sin espacios
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate(){
        this.checkFieldsBeforeInsert(); // aplica la misma limpieza al actualizar
    }



}
