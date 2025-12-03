import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  getHello(): string {
    const apiKey = this.configService.get<string>('DATABASE_URL');
    console.log('env.*.local =', this.configService.get<string>('DATABASE_URL'));
    console.log('env.local =', this.configService.get<string>('JWT_SECRET'));
    console.log(process.env.JWT_SECRET);

    return 'OK';
  }
}
