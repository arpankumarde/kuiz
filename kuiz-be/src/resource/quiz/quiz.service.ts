import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { DbService } from 'src/db/db.service';
import { Role } from 'src/enum/role.enum';
import { JwtPayload } from 'src/types/payload';
import { UserQuizAttemptInput } from 'src/types/quiz';

@Injectable()
export class QuizService {
  constructor(private readonly db: DbService) {}

  async create(createQuizDto: Prisma.QuizCreateInput, user: JwtPayload) {
    return this.db.quiz.create({
      data: {
        ...createQuizDto,
        admin: {
          connect: { id: user.sub },
        },
      },
    });
  }

  async findAll(user: JwtPayload) {
    if (user?.type === Role.ADMIN) {
      return this.db.quiz.findMany({
        include: {
          _count: {
            select: { questions: true },
          },
        },
      });
    } else if (user?.type === Role.USER) {
      const data = await this.db.quiz.findMany({
        include: {
          _count: {
            select: { questions: true },
          },
          quizAttempts: {
            where: { userId: user.sub },
          },
        },
      });

      // return data with quizzes with 10 questions
      return data.filter((quiz) => quiz._count.questions >= 10);
    }

    return this.db.quiz.findMany({
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.db.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });
  }

  async update(id: string, updateQuizDto: Prisma.QuizUpdateInput) {
    return this.db.quiz.update({
      where: { id },
      data: updateQuizDto,
    });
  }

  async remove(id: string) {
    return this.db.quiz.delete({
      where: { id },
    });
  }

  // questions
  async addQuestion(id: string, addQuestionDto: Prisma.QuestionCreateInput) {
    return this.db.question.create({
      data: {
        ...addQuestionDto,
        quiz: {
          connect: { id },
        },
      },
    });
  }

  async removeQuestion(id: string) {
    return this.db.question.delete({
      where: { id },
    });
  }

  async updateQuestion(
    id: string,
    updateQuestionDto: Prisma.QuestionUpdateInput,
  ) {
    return this.db.question.update({
      where: { id },
      data: updateQuestionDto,
    });
  }

  // quiz attempts
  async attemptQuiz(
    id: string,
    userQuizAttemptInput: UserQuizAttemptInput,
    user: JwtPayload,
  ) {
    // check if record in quiz_attempts exists for same user and quiz
    const quizAttempt = await this.db.quizAttempt.findFirst({
      where: {
        quizId: id,
        userId: user.sub,
      },
    });
    if (quizAttempt) {
      throw new ForbiddenException('You can only attempt a quiz once');
    }

    // get quiz questions
    const questions = await this.db.question.findMany({
      where: { quizId: id },
    });

    const userAnswers = userQuizAttemptInput.inputs;

    return this.db.quizAttempt.create({
      data: {
        quizId: id,
        userId: user.sub,
        score: Object.keys(userAnswers).reduce((acc, questionId) => {
          const question = questions.find((q) => q.id === questionId);
          if (question && question.answer === userAnswers[questionId]) {
            return acc + 1;
          }
          return acc;
        }, 0),
      },
    });
  }

  async getQuizAttempts(id: string) {
    return this.db.quizAttempt.findMany({
      where: { quizId: id },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async getUserQuizAttempts(userId: string) {
    return this.db.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: true,
      },
    });
  }
}
