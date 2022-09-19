import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { CiudadSupermercadoService } from './ciudad-supermercado.service';
import { CiudadEntity } from '../ciudad/ciudad.entity';
import { SupermercadoEntity } from '../supermercado/supermercado.entity';

describe('CiudadSupermercadoService', () => {
  let service: CiudadSupermercadoService;
  let ciudadRepository: Repository<CiudadEntity>;
  let supermercadoRepository: Repository<SupermercadoEntity>;
  let ciudad: CiudadEntity;
  let supermercadosList: SupermercadoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadSupermercadoService],
    }).compile();

    service = module.get<CiudadSupermercadoService>(CiudadSupermercadoService);
    ciudadRepository = module.get<Repository<CiudadEntity>>(getRepositoryToken(CiudadEntity));
    supermercadoRepository = module.get<Repository<SupermercadoEntity>>(getRepositoryToken(SupermercadoEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    supermercadoRepository.clear();
    ciudadRepository.clear();

    supermercadosList = [];
    for(let i = 0; i < 5; i++){
        const supermercado: SupermercadoEntity = await supermercadoRepository.save({
          nombre: "Supermercado prueba", //Más de 10 caracteres.
          longitud: faker.address.longitude(),
          latitud: faker.address.latitude(),
          web: faker.internet.domainName()
        })
        supermercadosList.push(supermercado);
    }

    ciudad = await ciudadRepository.save({
      nombre: faker.address.city(), 
      pais: "Argentina",
      numHabitantes: faker.datatype.number(),
      supermercados: supermercadosList
    })
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addSupermarketToCity should add an supermercado to a ciudad', async () => {
    const newSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      nombre: "Supermercado nuevo", //Más de 10 caracteres.
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      web: faker.internet.domainName()
    });

    const newCiudad: CiudadEntity = await ciudadRepository.save({
      nombre: faker.address.city(), 
      pais: "Argentina",
      numHabitantes: faker.datatype.number()
    })

    const result: CiudadEntity = await service.addSupermarketToCity(newCiudad.id, newSupermercado.id);
    
    expect(result.supermercados.length).toBe(1);
    expect(result.supermercados[0]).not.toBeNull();
    expect(result.supermercados[0].nombre).toBe(newSupermercado.nombre)
    expect(result.supermercados[0].latitud).toBe(newSupermercado.latitud)
    expect(result.supermercados[0].longitud).toBe(newSupermercado.longitud)
    expect(result.supermercados[0].web).toBe(newSupermercado.web)
  });

  it('addSupermarketToCity should thrown exception for an invalid supermercado', async () => {
    const newCiudad: CiudadEntity = await ciudadRepository.save({
      nombre: faker.address.city(), 
      pais: "Argentina",
      numHabitantes: faker.datatype.number()
    })

    await expect(() => service.addSupermarketToCity(newCiudad.id, "0")).rejects.toHaveProperty("message", "The supermercado with the given id was not found");
  });

  it('addSupermarketToCity should throw an exception for an invalid ciudad', async () => {
    const newSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      nombre: "Supermercado nuevo", //Más de 10 caracteres.
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      web: faker.internet.domainName()
    });

    await expect(() => service.addSupermarketToCity("0", newSupermercado.id)).rejects.toHaveProperty("message", "The ciudad with the given id was not found");
  });

  it('findSupermarketsFromCity should return supermercados by ciudad', async ()=>{
    const supermercados: SupermercadoEntity[] = await service.findSupermarketsFromCity(ciudad.id);
    expect(supermercados.length).toBe(5)
  });

  it('findSupermarketsFromCity should throw an exception for an invalid ciudad', async () => {
    await expect(()=> service.findSupermarketsFromCity("0")).rejects.toHaveProperty("message", "The ciudad with the given id was not found"); 
  });



  it('findSupermarketFromCity should return supermercado by ciudad', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    const storedSupermercado: SupermercadoEntity = await service.findSupermarketFromCity(ciudad.id, supermercado.id, )
    expect(storedSupermercado).not.toBeNull();
    expect(storedSupermercado.nombre).toBe(supermercado.nombre);
    expect(storedSupermercado.latitud).toBe(supermercado.latitud);
    expect(storedSupermercado.longitud).toBe(supermercado.longitud);
    expect(storedSupermercado.web).toBe(supermercado.web);
  });

  it('findSupermarketFromCity should throw an exception for an invalid supermercado', async () => {
    await expect(()=> service.findSupermarketFromCity(ciudad.id, "0")).rejects.toHaveProperty("message", "The supermercado with the given id was not found"); 
  });

  it('findSupermarketFromCity should throw an exception for an invalid ciudad', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0]; 
    await expect(()=> service.findSupermarketFromCity("0", supermercado.id)).rejects.toHaveProperty("message", "The ciudad with the given id was not found"); 
  });

  it('findSupermarketFromCity should throw an exception for an supermercado not associated to the ciudad', async () => {
    const newSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      nombre: "Supermercado nuevo", //Más de 10 caracteres.
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      web: faker.internet.domainName()
    });

    await expect(()=> service.findSupermarketFromCity(ciudad.id, newSupermercado.id)).rejects.toHaveProperty("message", "The supermercado with the given id is not associated to the ciudad"); 
  });



  it('updateSupermarketsFromCity should update supermercados list for a ciudad', async () => {
    const newSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      nombre: "Supermercado nuevo", //Más de 10 caracteres.
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      web: faker.internet.domainName()
    });

    const updatedCiudad: CiudadEntity = await service.updateSupermarketsFromCity(ciudad.id, [newSupermercado]);
    expect(updatedCiudad.supermercados.length).toBe(1);

    expect(updatedCiudad.supermercados[0].nombre).toBe(newSupermercado.nombre);
    expect(updatedCiudad.supermercados[0].longitud).toBe(newSupermercado.longitud);
    expect(updatedCiudad.supermercados[0].latitud).toBe(newSupermercado.latitud);
    expect(updatedCiudad.supermercados[0].web).toBe(newSupermercado.web);
  });

  it('updateSupermarketsFromCity should throw an exception for an invalid ciudad', async () => {
    const newSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      nombre: "Supermercado nuevo", //Más de 10 caracteres.
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      web: faker.internet.domainName()
    });

    await expect(()=> service.updateSupermarketsFromCity("0", [newSupermercado])).rejects.toHaveProperty("message", "The ciudad with the given id was not found"); 
  });

  it('updateSupermarketsFromCity should throw an exception for an invalid supermercado', async () => {
    const newSupermercado: SupermercadoEntity = supermercadosList[0];
    newSupermercado.id = "0";

    await expect(()=> service.updateSupermarketsFromCity(ciudad.id, [newSupermercado])).rejects.toHaveProperty("message", "The supermercado with the given id was not found"); 
  });



  it('deleteSupermarketFromCity should remove an supermercado from a ciudad', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    
    await service.deleteSupermarketFromCity(ciudad.id, supermercado.id);

    const storedCiudad: CiudadEntity = await ciudadRepository.findOne({where: {id: ciudad.id}, relations: ["supermercados"]});
    const deletedSupermercado: SupermercadoEntity = storedCiudad.supermercados.find(a => a.id === supermercado.id);

    expect(deletedSupermercado).toBeUndefined();

  });

  it('deleteSupermarketFromCity should thrown an exception for an invalid supermercado', async () => {
    await expect(()=> service.deleteSupermarketFromCity(ciudad.id, "0")).rejects.toHaveProperty("message", "The supermercado with the given id was not found"); 
  });

  it('deleteSupermarketFromCity should thrown an exception for an invalid ciudad', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    await expect(()=> service.deleteSupermarketFromCity("0", supermercado.id)).rejects.toHaveProperty("message", "The ciudad with the given id was not found"); 
  });

  it('deleteSupermarketFromCity should thrown an exception for an non asocciated supermercado', async () => {
    const newSupermercado: SupermercadoEntity = await supermercadoRepository.save({
      nombre: "Supermercado nuevo", //Más de 10 caracteres.
      longitud: faker.address.longitude(),
      latitud: faker.address.latitude(),
      web: faker.internet.domainName()
    });

    await expect(()=> service.deleteSupermarketFromCity(ciudad.id, newSupermercado.id)).rejects.toHaveProperty("message", "The supermercado with the given id is not associated to the ciudad"); 
  }); 

});
