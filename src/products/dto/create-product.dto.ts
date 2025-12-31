import { IsIn, IsString, MinLength, IsNumber, IsPositive, IsOptional, IsInt, IsArray } from "class-validator";



export class CreateProductDto {

    @IsString()
    @MinLength(1)
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @IsString({ each: true }) // Cada uno de los elementos de este arreglo deben de cumplir la condicion de ser string - indica que es un arreglo de strings      
    @IsOptional()
    @IsArray()
    sizes: string[];

    @IsIn(['men', 'woman', 'kid', 'unisex']) // valida que el valor este dentro de los permitidos
    gender: string;

}
