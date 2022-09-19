import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupermercadoEntity } from 'src/supermercado/supermercado.entity';
import { CiudadEntity } from '../ciudad/ciudad.entity';
import { CiudadSupermercadoService } from './ciudad-supermercado.service';
import { CiudadSupermercadoController } from './ciudad-supermercado.controller';

@Module({
    imports: [TypeOrmModule.forFeature([CiudadEntity, SupermercadoEntity])],
    providers: [CiudadSupermercadoService],
    controllers: [CiudadSupermercadoController]
})
export class CiudadSupermercadoModule {}
