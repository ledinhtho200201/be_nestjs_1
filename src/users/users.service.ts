import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User as UserM, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import { User } from 'src/decorator/customize';
import aqp from 'api-query-params';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { USER_ROLE } from 'src/databases/sample';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name)
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) { }

  getHashPassword = (plainText: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(plainText, salt);
    return hash;
  }

  async create(createUserDto: CreateUserDto, @User() user: IUser) {
    const { email } = createUserDto;
    // add logic check email
    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại. Vui lòng sử dụng email khác.`)
    }
    const hashPassword = this.getHashPassword(createUserDto.password);
    let newUser = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return {
      _id: newUser._id,
      createdAt: newUser.createdAt
    };
  }

  async register(user: RegisterUserDto) {
    const { name, email, password, age, gender, address } = user;
    // add logic check email
    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại. Vui lòng sử dụng email khác.`)
    }
    // fetch user role
    const userRole = await this.roleModel.findOne({ name: USER_ROLE })

    const hashPassword = this.getHashPassword(password);
    let newRegister = await this.userModel.create({
      name: name,
      email: email,
      password: hashPassword,
      age: age,
      gender: gender,
      address: address,
      role: userRole?._id
    })
    return (newRegister);
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel.find(filter).select("-password")
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result,
    }
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return `not found user`;
    }
    return this.userModel.findOne({
      _id: id
    })
      .select("-password")
      .populate({ path: "role", select: { _id: 1, name: 1 } });
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({
      email: username
    }).populate({ path: "role", select: { name: 1 } })
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    return await this.userModel.updateOne({ _id: updateUserDto._id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      });
  }

  async remove(id: string, user: IUser) {
    // admin@gmail.com
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return `not found user`;
    }
    const foundUser = await this.userModel.findById(id);
    if (foundUser && foundUser.email === 'admin@gmail.com') {
      throw new BadRequestException("Không thể xóa tài khoản admin@gmail.com")
    }
    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        },
        // isDeleted: true,
        // deletedAt: new Date()
      },
    )
    return this.userModel.softDelete({
      _id: id
    })
  }

  updateUserToken = async (_id: string, refreshToken: string) => {
    return await this.userModel.updateOne(
      { _id },
      { refreshToken }
    );
  }

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken })
      .populate({
        path: "role",
        select: { name: 1 }
      });
  }
}
