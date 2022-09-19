import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { SupermercadoService } from './supermercado.service';

import { faker } from '@faker-js/faker';
import { SupermercadoEntity } from './supermercado.entity';

describe('SupermercadoService', () => {
  let service: SupermercadoService;
  let repository: Repository<SupermercadoEntity>;
  let supermercadosList: SupermercadoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SupermercadoService],
    }).compile();

    service = module.get<SupermercadoService>(SupermercadoService);
    repository = module.get<Repository<SupermercadoEntity>>(getRepositoryToken(SupermercadoEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    supermercadosList = [];
    for(let i = 0; i < 5; i++){
        const supermercado: SupermercadoEntity = await repository.save({
        nombre: "Supermercado prueba", //Más de 10 caracteres.
        longitud: faker.address.longitude(),
        latitud: faker.address.latitude(),
        web: faker.internet.domainName()})
        supermercadosList.push(supermercado);
    }
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //Test findAll
  it('findAll should return all supermercados', async () => {
    const supermercados: SupermercadoEntity[] = await service.findAll();
    expect(supermercados).not.toBeNull();
    expect(supermercados).toHaveLength(supermercadosList.length);
  });

  //Test findOne
  it('findOne should return a supermercado by id', async () => {
    const storedSupermercado: SupermercadoEntity = supermercadosList[0];
    const supermercado: SupermercadoEntity = await service.findOne(storedSupermercado.id);
    expect(supermercado).not.toBeNull();
    expect(supermercado.nombre).toEqual(storedSupermercado.nombre)
    expect(supermercado.latitud).toEqual(storedSupermercado.latitud)
    expect(supermercado.longitud).toEqual(storedSupermercado.longitud)
    expect(supermercado.web).toEqual(storedSupermercado.web)
  });

  //Test findOne invalid suermercado
  it('findOne should throw an exception for an invalid supermercado', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "The supermercado with the given id was not found")
  });

  //Test create
  it('create should return a new supermercado', async () => {
    const supermercado: SupermercadoEntity = {
      id: "",
      nombre: "Supermercado test", //Más de 10 caracteres.
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      web: faker.internet.domainName(),
      ciudad: null
    }

    const newSupermercado: SupermercadoEntity = await service.create(supermercado);
    expect(newSupermercado).not.toBeNull();

    const storedSupermercado: SupermercadoEntity = await repository.findOne({where: {id: newSupermercado.id}})
    expect(storedSupermercado).not.toBeNull();
    expect(storedSupermercado.nombre).toEqual(newSupermercado.nombre)
    expect(storedSupermercado.longitud).toEqual(newSupermercado.longitud)
    expect(storedSupermercado.latitud).toEqual(newSupermercado.latitud)
    expect(storedSupermercado.web).toEqual(newSupermercado.web)
  });

  //Test create supermercado with invalid name
  it('create should throw an exception for an invalid name', async () => {
    const supermercado: SupermercadoEntity = {
      id: "",
      nombre: "Super", //Menos de 10 caracteres.
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      web: faker.internet.domainName(),
      ciudad: null
    }

    await expect(() => service.create(supermercado)).rejects.toHaveProperty("message", "El nombre debe tener más de 10 caracteres")
  });

  //Test update
  it('update should modify a supermercado', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    supermercado.longitud = faker.address.longitude();
    supermercado.latitud = faker.address.latitude();
  
    const updatedSupermercado: SupermercadoEntity = await service.update(supermercado.id, supermercado);
    expect(updatedSupermercado).not.toBeNull();
  
    const storedSupermercado: SupermercadoEntity = await repository.findOne({ where: { id: supermercado.id } })
    expect(storedSupermercado).not.toBeNull();
    expect(storedSupermercado.longitud).toEqual(supermercado.longitud)
    expect(storedSupermercado.latitud).toEqual(supermercado.latitud)
  });
 
  //Test update invalid supermercado
  it('update should throw an exception for an invalid supermercado', async () => {
    let supermercado: SupermercadoEntity = supermercadosList[0];
    supermercado = {
      ...supermercado, nombre: "Nombre nuevo"
    }
    await expect(() => service.update("0", supermercado)).rejects.toHaveProperty("message", "The supermercado with the given id was not found")
  });

  //Test update supermercado with invalid name
  it('update should throw an exception for an invalid name', async () => {
    let supermercado: SupermercadoEntity = supermercadosList[0];
    supermercado = {
      ...supermercado, nombre: "Test"
    }
    await expect(() => service.update(supermercado.id, supermercado)).rejects.toHaveProperty("message", "El nombre debe tener más de 10 caracteres")
  });

});
