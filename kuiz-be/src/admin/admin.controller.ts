import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Prisma } from 'generated/prisma';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('register')
  register(@Body() createAdminDto: Prisma.AdminCreateInput) {
    return this.adminService.register(createAdminDto);
  }

  @Post('login')
  login(@Body() loginDto: { email: string; password: string }) {
    return this.adminService.login(loginDto.email, loginDto.password);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdminDto: Prisma.AdminUpdateInput,
  ) {
    return this.adminService.update(id, updateAdminDto);
  }
}
