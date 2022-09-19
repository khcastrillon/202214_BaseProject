import {IsNotEmpty, IsString, IsUrl, IsNumber} from 'class-validator';
export class SupermercadoDto {
    @IsString()
    @IsNotEmpty() 
    readonly nombre: string;
    
    @IsUrl()
    @IsNotEmpty()
    readonly pais: string;
    
    @IsNumber()
    @IsNotEmpty()
    readonly longitud: number;

    @IsNumber()
    @IsNotEmpty()
    readonly latitud: number;
}
