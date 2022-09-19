import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { SupermercadoEntity } from './supermercado.entity';

@Injectable()
export class SupermercadoService {
    constructor(
        @InjectRepository(SupermercadoEntity)
        private readonly supermercadoRepository: Repository<SupermercadoEntity>
    ){}

    async findAll(): Promise<SupermercadoEntity[]> {
        return await this.supermercadoRepository.find();
    }

    async findOne(id: string): Promise<SupermercadoEntity> {
        const supermercado: SupermercadoEntity = await this.supermercadoRepository.findOne({where: {id}} );
        if (!supermercado)
          throw new BusinessLogicException("The supermercado with the given id was not found", BusinessError.NOT_FOUND);
    
        return supermercado;
    }
    
    async create(supermercado: SupermercadoEntity): Promise<SupermercadoEntity> {
        if(supermercado.nombre.length < 10)
            throw new BusinessLogicException("El nombre debe tener más de 10 caracteres", BusinessError.PRECONDITION_FAILED);

        return await this.supermercadoRepository.save(supermercado);
    }

    async update(id: string, supermercado: SupermercadoEntity): Promise<SupermercadoEntity> {
        const persistedSupermercado: SupermercadoEntity = await this.supermercadoRepository.findOne({where:{id}});

        if(supermercado.nombre.length < 10)
            throw new BusinessLogicException("El nombre debe tener más de 10 caracteres", BusinessError.PRECONDITION_FAILED);
            
        if (!persistedSupermercado)
          throw new BusinessLogicException("The supermercado with the given id was not found", BusinessError.NOT_FOUND);
        
        return await this.supermercadoRepository.save({...persistedSupermercado, ...supermercado});
    }

    async delete(id: string) {
        const supermercado: SupermercadoEntity = await this.supermercadoRepository.findOne({where:{id}});
        if (!supermercado)
          throw new BusinessLogicException("The supermercado with the given id was not found", BusinessError.NOT_FOUND);
      
        await this.supermercadoRepository.remove(supermercado);
    }
}
