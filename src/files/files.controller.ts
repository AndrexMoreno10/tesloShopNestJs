import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';


ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) { }

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {

    const path = this.filesService.getStaticProductImage(imageName); // Llama al servicio para obtener la ruta de la imagen

    res.sendFile(path); // Envía el archivo como respuesta


    return path;
  }


  @Post('product')
  @UseInterceptors(FileInterceptor('file', { // 'file' es el nombre del campo en el formulario de postman
    fileFilter: fileFilter, // Aquí puedes agregar el filtro de archivos si lo deseas
    // limits: { fileSize: 1024 * 1024 * 5 } // Limitar el tamaño del archivo a 5MB
    storage: diskStorage({
      destination: './static/products', // Carpeta donde se guardarán los archivos en file System
      filename: fileNamer 
    })

  }))
  uploadFile(
    @UploadedFile() file: Express.Multer.File
  ) { 

    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUrl = `${ this.configService.get('HOST_API') }/files/product/${ file.filename }`; 
    return { secureUrl };
  }

}
