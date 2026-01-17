import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";


export class PaginationDto {

    @ApiProperty({
        description: 'Number of items to return',
        default: 10,
    })
    @IsOptional()
    @IsPositive()
    @Type(() => Number) // transforma el valor a number -> enebaleImplocoitConversions:true
    limit?: number;

    @ApiProperty({
        description: 'Number of items to skip',
        default: 0,
    })
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    offset?: number;

}