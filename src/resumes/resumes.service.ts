import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { IUser } from 'src/users/users.interface';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>) { }

  async create(createResumeDto: CreateUserCvDto, user: IUser) {
    const { email, name, _id, role } = user;
    const { url, companyId, jobId } = createResumeDto;
    let newResume = await this.resumeModel.create({
      email,
      companyId,
      jobId,
      userId: _id,
      status: 'PENDING',
      history: [{
        status: 'PENDING',
        updatedAt: new Date,
        updatedBy: {
          _id,
          email
        }
      }],
      createdBy: {
        _id,
        email
      }
    })
    return {
      _id: newResume._id,
      createdAt: newResume.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
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

  async findOne(id: string) {
    return await this.resumeModel.findOne({ _id: id });
  }

  findCvByUser = async (user: IUser) => {
    return await this.resumeModel.find({ userId: user._id })
      .sort("-createdAt")
      .populate([
        {
          path: "companyId",
          select: { name: 1 }
        },
        {
          path: "jobId",
          select: { name: 1 }
        }
      ])
  }

  async update(id: string, status: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("not found resume");
    }

    const updatedCv = await this.resumeModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          status,
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        },
        $push: {
          history: {
            status,
            updatedAt: new Date(),
            updatedBy: {
              _id: user._id,
              email: user.email
            }
          }
        }
      })
    return updatedCv;
  }

  async remove(id: string, user: IUser) {
    await this.resumeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        },
      },
    )
    return this.resumeModel.softDelete({
      _id: id
    })
  }
}
