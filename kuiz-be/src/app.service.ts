import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  base(): object {
    return { message: 'Server is running!' };
  }
}
