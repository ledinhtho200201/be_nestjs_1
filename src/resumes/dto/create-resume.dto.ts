import { Type } from "class-transformer";
import { IsArray, IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, ValidateNested } from "class-validator";
import mongoose from "mongoose";

export class CreateResumeDto {
    @IsEmail({}, { message: 'Email không đúng định dạng', })
    @IsNotEmpty({ message: 'Email không được để trống', })
    email: string;

    @IsNotEmpty({ message: "userId không được để trống!" })
    userId: string

    @IsNotEmpty({ message: "companyId không được để trống!" })
    companyId: string

    @IsNotEmpty({ message: "jobId không được để trống!" })
    jobId: string

    @IsNotEmpty({ message: 'url không được để trống', })
    url: string;

    @IsNotEmpty({ message: 'Status không được để trống', })
    status: string;
}

export class CreateUserCvDto {
    @IsNotEmpty({ message: "companyId không được để trống!" })
    @IsMongoId({ message: 'companyId là một mongo id' })
    companyId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: "jobId không được để trống!" })
    @IsMongoId({ message: 'jobId là một mongo id' })
    jobId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'url không được để trống', })
    url: string;
}



