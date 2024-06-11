import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { genSaltSync, hashSync } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  getHashPassword = (plainText: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(plainText, salt);
    return hash;
  }

  // create(createUserDto: CreateUserDto) {
  async create(email: string, password: string, name: string) {
    const hashPassword = this.getHashPassword(password);
    let user = await this.userModel.create({
      email, password: hashPassword, name
    })
    return user;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
