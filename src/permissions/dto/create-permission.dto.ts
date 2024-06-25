import { Type } from "class-transformer";
import { IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, ValidateNested } from "class-validator";

export class CreatePermissionDto {
    @IsNotEmpty({ message: 'Name không được để trống', })
    name: string;

    @IsNotEmpty({ message: "apiPath không được để trống!" })
    apiPath: string

    @IsNotEmpty({ message: "method không được để trống!" })
    method: string

    @IsNotEmpty({ message: "module không được để trống!" })
    module: string
}





