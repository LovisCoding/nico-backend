import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ImagesModule } from './images/images.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SectionsImagesModule } from './sections-images/sections-images.module';
import { SectionsModule } from './sections/sections.module';
import { ServeStaticModule } from "@nestjs/serve-static";
import {join} from "node:path";

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: [`.env.${process.env.NODE_ENV || 'development'}.local`, '.env.local','.env'],
  }), PrismaModule, ImagesModule, AuthModule, UsersModule, SectionsImagesModule,
      SectionsModule

],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
