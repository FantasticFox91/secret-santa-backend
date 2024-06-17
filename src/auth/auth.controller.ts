import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    return this.authService.createUser(email, password);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    return this.authService.loginUser(email, password);
  }

  @UseGuards(AuthGuard)
  @Get('guard')
  async test() {
    console.log('test');
  }
}
