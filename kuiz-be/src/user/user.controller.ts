import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma } from 'generated/prisma';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.userService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginDto: { email: string; password: string }) {
    return this.userService.login(loginDto.email, loginDto.password);
  }

  @Post('change-password')
  changePassword(
    @Body() changePasswordDto: { email: string; password: string },
  ) {
    return this.userService.changePassword(
      changePasswordDto.email,
      changePasswordDto.password,
    );
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Prisma.UserUpdateInput,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
