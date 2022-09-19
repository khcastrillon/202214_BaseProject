import {IsNotEmpty, IsString, IsUrl} from 'class-validator';
export class SupermercadoDto {
    @IsString()
    @IsNotEmpty() 
    readonly nombre: string;
    
    @IsString()
    @IsNotEmpty()
    readonly longitud: number;

    @IsString()
    @IsNotEmpty()
    readonly latitud: number;

    @IsUrl()
    @IsNotEmpty()
    readonly web: string;
}
