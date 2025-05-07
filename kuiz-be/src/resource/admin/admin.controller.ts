import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Prisma } from 'generated/prisma';
import { Public } from 'src/decorator/public.decorator';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/enum/role.enum';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Public()
  @Post('register')
  register(@Body() createAdminDto: Prisma.AdminCreateInput) {
    return this.adminService.register(createAdminDto);
  }

  @Public()
  @Post('login')
  login(@Body() loginDto: { email: string; password: string }) {
    return this.adminService.login(loginDto.email, loginDto.password);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdminDto: Prisma.AdminUpdateInput,
  ) {
    return this.adminService.update(id, updateAdminDto);
  }
}
