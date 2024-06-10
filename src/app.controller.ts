import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService
  ) { }

  @Get() // route / => api (resful)
  @Render("home")
  handleHomePage() {
    // port from .env
    console.log(">>> check port = ", this.configService.get<string>("PORT"))

    const message = this.appService.getHello();
    return {
      message: message
    }
    //return "this.appService.getHello()";
  }

  @Get('abc')
  getHello1(): string {
    return 'this.appService.getHello() abc';
  }
}
