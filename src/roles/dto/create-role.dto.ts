import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsMongoId, IsNotEmpty, ValidateNested } from "class-validator";
import mongoose from "mongoose";

export class CreateRoleDto {
    @IsNotEmpty({ message: 'Name không được để trống', })
    name: string;

    @IsNotEmpty({ message: "description không được để trống!" })
    description: string

    @IsBoolean({ message: "isActive có định dạng là boolean" })
    @IsNotEmpty({ message: "isActive không được để trống!" })
    isActive: boolean

    @IsNotEmpty({ message: 'role không được để trống' })
    @IsMongoId({ each: true, message: "Mỗi permission là mongo object id" })
    @IsArray({ message: 'permissions có định dạng là array' })
    permissions: mongoose.Schema.Types.ObjectId[];
}