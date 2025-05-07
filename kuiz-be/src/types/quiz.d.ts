import { Question } from 'generated/prisma';

export type UserQuizAttemptInput = {
  inputs: {
    [key: Question['id']]: Question['answer'];
  };
};
