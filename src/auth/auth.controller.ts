import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(
    @Body() body: { email: string; password: string; username: string },
  ) {
    const { username, email, password } = body;
    return this.authService.createUser(email, password, username);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    return this.authService.loginUser(email, password);
  }

  @UseGuards(AuthGuard)
  @Post('invite')
  @HttpCode(201)
  async inviteUser(
    @Body() body: { email: string; name: string; eventID: string },
  ) {
    const { email, name, eventID } = body;
    return this.authService.inviteUser(email, name, eventID);
  }

  @Post('login/token')
  @HttpCode(200)
  async loginByToken(@Headers('authorization') authHeader: string) {
    const token = authHeader?.split(' ')[1];
    return this.authService.loginUserByToken(token);
  }

  @UseGuards(AuthGuard)
  @Get('guard')
  async test() {
    console.log('test');
  }
}
