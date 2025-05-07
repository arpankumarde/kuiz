import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/guard/auth/auth.guard';
import { RolesGuard } from 'src/guard/roles/roles.guard';

@Module({
  controllers: [QuizController],
  providers: [
    QuizService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class QuizModule {}
