import { IsIn, IsString, MinLength, IsNumber, IsPositive, IsOptional, IsInt, IsArray } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';



export class CreateProductDto {

    @ApiProperty({
        description: 'Product title (unique)',
        nullable: false,
        default: 10,
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty({
        description: 'Product price',
        nullable: false,
        default: 0,
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty({
        description: 'Product description',
        nullable: true,
        default: null,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'Product slug (unique)',
        nullable: true,
        default: null,
    })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({
        description: 'Product stock',
        nullable: true,
        default: 0,
    })
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty({
        description: 'Product sizes',
        nullable: true,
    })
    @IsString({ each: true }) // Cada uno de los elementos de este arreglo deben de cumplir la condicion de ser string - indica que es un arreglo de strings      
    @IsOptional()
    @IsArray()
    sizes: string[];
    
    @ApiProperty({
        description: 'Product gender',

    })
    @IsIn(['men', 'woman', 'kid', 'unisex']) // valida que el valor este dentro de los permitidos
    gender: string;

    @ApiProperty({
        description: 'Product tags',
        nullable: true,
    })
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags: string[]

    @ApiProperty({
        description: 'Product images',
        nullable: true,
    })
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[]
}
