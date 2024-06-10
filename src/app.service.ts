import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {

    // modol: code
    return 'I"m data from db!';
  }
}
