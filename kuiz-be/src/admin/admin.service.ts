import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DbService } from 'src/db/db.service';
import { Prisma } from 'generated/prisma';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    private readonly db: DbService,
    private jwtService: JwtService,
  ) {}

  async register(createAdminDto: Prisma.AdminCreateInput) {
    const existingUser = await this.db.admin.findUnique({
      where: { email: createAdminDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

    const user = await this.db.admin.create({
      data: { ...createAdminDto, password: hashedPassword },
    });

    const payload = { sub: user.id, type: 'ADMIN' };
    return { user, accessToken: this.jwtService.sign(payload) };
  }

  async login(email: string, password: string) {
    const user = await this.findOne(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (await this.verifyPassword(password, user?.password)) {
      const payload = { sub: user.id, type: 'ADMIN' };
      return { user, accessToken: this.jwtService.sign(payload) };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async findOne(email: string) {
    return this.db.admin.findUnique({ where: { email } });
  }

  async update(id: string, updateAdminDto: Prisma.AdminUpdateInput) {
    if (updateAdminDto.password) {
      const hashedPassword = await bcrypt.hash(
        updateAdminDto.password as string,
        10,
      );
      updateAdminDto.password = hashedPassword;
    }

    return this.db.admin.update({ where: { id }, data: updateAdminDto });
  }

  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
