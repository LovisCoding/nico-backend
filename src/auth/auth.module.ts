import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { jwtConstants } from './constants';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  controllers: [AuthController],
  providers: [AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }],
  imports: [UsersModule, PrismaModule, ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: [`.env.${process.env.NODE_ENV || 'development'}.local`, '.env.local','.env'],
  }),
    JwtModule.register({
        global: true,
        secret:jwtConstants.secret,
        signOptions: {expiresIn: '1296000s' /* 15 days */}
      },
    )],
})
export class AuthModule {}
