import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SignInAuthDto } from './dto/signIn-auth.dto';
import { AuthService } from './auth.service';
import { Public } from 'src/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: SignInAuthDto) {
    return this.authService.signIn(signInDto);
  }
}
