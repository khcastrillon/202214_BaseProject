import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CiudadEntity } from '../ciudad/ciudad.entity';

@Entity()
export class SupermercadoEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nombre: string;
    
    @Column()
    longitud: string;
    
    @Column()
    latitud: string;

    @Column()
    web: string;

    @ManyToOne(() => CiudadEntity, ciudad => ciudad.supermercados)
    ciudad: CiudadEntity;
}
