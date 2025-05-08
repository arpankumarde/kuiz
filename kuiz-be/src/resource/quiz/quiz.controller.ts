import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { Prisma } from 'generated/prisma';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/enum/role.enum';
import { Request } from 'express';
import { JwtPayload } from 'src/types/payload';
import { UserQuizAttemptInput } from 'src/types/quiz';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Roles(Role.ADMIN)
  @Post('create')
  create(
    @Body() createQuizDto: Prisma.QuizCreateInput,
    @Req() request: Request,
  ) {
    return this.quizService.create(
      createQuizDto,
      request['user'] as JwtPayload,
    );
  }

  @Get()
  findAll(@Req() request: Request) {
    return this.quizService.findAll(request['user'] as JwtPayload);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuizDto: Prisma.QuizUpdateInput,
  ) {
    return this.quizService.update(id, updateQuizDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quizService.remove(id);
  }

  // questions
  @Roles(Role.ADMIN)
  @Post('add-question/:id')
  addQuestion(
    @Param('id') id: string,
    @Body() addQuestionDto: Prisma.QuestionCreateInput,
  ) {
    return this.quizService.addQuestion(id, addQuestionDto);
  }

  @Roles(Role.ADMIN)
  @Patch('question/:id')
  updateQuestion(
    @Param('id') id: string,
    @Body() updateQuestionDto: Prisma.QuestionUpdateInput,
  ) {
    return this.quizService.updateQuestion(id, updateQuestionDto);
  }

  @Roles(Role.ADMIN)
  @Delete('question/:id')
  removeQuestion(@Param('id') id: string) {
    return this.quizService.removeQuestion(id);
  }

  // quiz attempts
  @Roles(Role.USER)
  @Post('attempt/:id')
  attemptQuiz(
    @Param('id') id: string,
    @Body() userQuizAttemptInput: UserQuizAttemptInput,
    @Req() request: Request,
  ) {
    return this.quizService.attemptQuiz(
      id,
      userQuizAttemptInput,
      request['user'] as JwtPayload,
    );
  }

  @Get('attempt/:id')
  getQuizAttempt(@Param('id') id: string) {
    return this.quizService.getQuizAttempts(id);
  }

  @Roles(Role.USER)
  @Get('attempts')
  getUserQuizAttempts(@Req() request: Request) {
    return this.quizService.getUserQuizAttempts(
      (request['user'] as JwtPayload).sub,
    );
  }
}
