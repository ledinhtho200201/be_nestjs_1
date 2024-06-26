import { IsArray, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateSubscriberDto {
    @IsNotEmpty({ message: 'Name không được để trống', })
    @IsEmail()
    email: string;

    @IsNotEmpty({ message: 'Name không được để trống', })
    name: string;

    @IsNotEmpty({ each: true, message: 'Skills không được để trống' })
    @IsArray({ message: 'skills có định dạng là aray' })
    @IsString({ each: true, message: 'Kiểm tra lại kiểu của Skills (dạng string)' })
    skills: string[];

}
