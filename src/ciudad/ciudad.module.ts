import { Module } from '@nestjs/common';
import { CiudadService } from './ciudad.service';

@Module({
  providers: [CiudadService]
})
export class CiudadModule {}
