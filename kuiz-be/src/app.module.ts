import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { AdminModule } from './resource/admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './resource/user/user.module';
import { QuizModule } from './resource/quiz/quiz.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DbModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
    AdminModule,
    UserModule,
    QuizModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
