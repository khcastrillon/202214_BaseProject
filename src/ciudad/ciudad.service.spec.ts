import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { CiudadEntity } from './ciudad.entity';
import { CiudadService } from './ciudad.service';

import { faker } from '@faker-js/faker';

describe('CiudadService', () => {
  let service: CiudadService;
  let repository: Repository<CiudadEntity>;
  let ciudadesList: CiudadEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadService],
    }).compile();

    service = module.get<CiudadService>(CiudadService);
    repository = module.get<Repository<CiudadEntity>>(getRepositoryToken(CiudadEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    ciudadesList = [];
    for(let i = 0; i < 5; i++){
        const ciudad: CiudadEntity = await repository.save({
        nombre: faker.address.city(), 
        pais: "Argentina",
        numHabitantes: faker.datatype.number()})
        ciudadesList.push(ciudad);
    }
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //Test findAll
  it('findAll should return all ciudades', async () => {
    const ciudades: CiudadEntity[] = await service.findAll();
    expect(ciudades).not.toBeNull();
    expect(ciudades).toHaveLength(ciudadesList.length);
  });

  //Test findOne
  it('findOne should return a ciudad by id', async () => {
    const storedCiudad: CiudadEntity = ciudadesList[0];
    const ciudad: CiudadEntity = await service.findOne(storedCiudad.id);
    expect(ciudad).not.toBeNull();
    expect(ciudad.nombre).toEqual(storedCiudad.nombre)
    expect(ciudad.numHabitantes).toEqual(storedCiudad.numHabitantes)
    expect(ciudad.pais).toEqual(storedCiudad.pais)
  });

  //Test findOne invalid ciudad
  it('findOne should throw an exception for an invalid ciudad', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "The ciudad with the given id was not found")
  });

  //Test create
  it('create should return a new ciudad', async () => {
    const ciudad: CiudadEntity = {
      id: "",
      nombre: faker.address.city(), 
      pais: "Ecuador",
      numHabitantes: faker.datatype.number(),
      supermercados: []
    }

    const newCiudad: CiudadEntity = await service.create(ciudad);
    expect(newCiudad).not.toBeNull();

    const storedCiudad: CiudadEntity = await repository.findOne({where: {id: newCiudad.id}})
    expect(storedCiudad).not.toBeNull();
    expect(storedCiudad.nombre).toEqual(newCiudad.nombre)
    expect(storedCiudad.numHabitantes).toEqual(newCiudad.numHabitantes)
    expect(storedCiudad.pais).toEqual(newCiudad.pais)
  });

  //Test create ciudad with invalid country
  it('create should throw an exception for an invalid country', async () => {
    const ciudad: CiudadEntity = {
      id: "",
      nombre: faker.address.city(), 
      pais: "Pais inválido",
      numHabitantes: faker.datatype.number(),
      supermercados: []
    }

    await expect(() => service.create(ciudad)).rejects.toHaveProperty("message", "Invalid country")
  });

  //Test update
  it('update should modify a ciudad', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    ciudad.nombre = "New name";
    ciudad.numHabitantes = faker.datatype.number();
  
    const updatedCiudad: CiudadEntity = await service.update(ciudad.id, ciudad);
    expect(updatedCiudad).not.toBeNull();
  
    const storedCiudad: CiudadEntity = await repository.findOne({ where: { id: ciudad.id } })
    expect(storedCiudad).not.toBeNull();
    expect(storedCiudad.nombre).toEqual(ciudad.nombre)
    expect(storedCiudad.numHabitantes).toEqual(ciudad.numHabitantes)
  });
 
  //Test update invalid ciudad
  it('update should throw an exception for an invalid ciudad', async () => {
    let ciudad: CiudadEntity = ciudadesList[0];
    ciudad = {
      ...ciudad, nombre: "New name", numHabitantes: faker.datatype.number()
    }
    await expect(() => service.update("0", ciudad)).rejects.toHaveProperty("message", "The ciudad with the given id was not found")
  });

  //Test update ciudad with invalid country
  it('update should throw an exception for an invalid country', async () => {
    let ciudad: CiudadEntity = ciudadesList[0];
    ciudad = {
      ...ciudad, pais: "Pais invalido"
    }
    await expect(() => service.update(ciudad.id, ciudad)).rejects.toHaveProperty("message", "Invalid country")
  });

  it('delete should remove a ciudad', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    await service.delete(ciudad.id);
  
    const deletedCiudad: CiudadEntity = await repository.findOne({ where: { id: ciudad.id } })
    expect(deletedCiudad).toBeNull();
  });

  it('delete should throw an exception for an invalid ciudad', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    await service.delete(ciudad.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "The ciudad with the given id was not found")
  });

});
