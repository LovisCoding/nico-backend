import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInAuthDto } from './dto/signIn-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from "bcryptjs";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService ) {
  }

  async signIn(signInDto: SignInAuthDto): Promise<{ access_token: string }> {
    const user = await this.prisma.users.findUnique({
      where: { name: signInDto.name },
    });

    if (!user) {
      throw new  UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(signInDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...result } = user;
    const payload = { id: user.id, name: user.name };
    return { access_token: this.jwtService.sign(payload) };
  }
}
