import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from 'generated/prisma';
import { DbService } from 'src/db/db.service';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from 'src/types/payload';
import { Role } from 'src/enum/role.enum';

@Injectable()
export class UserService {
  constructor(
    private readonly db: DbService,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: Prisma.UserCreateInput) {
    const existingUser = await this.db.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.db.user.create({
      data: { ...createUserDto, password: hashedPassword },
    });
  }

  async login(email: string, password: string) {
    const user = await this.findOne(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (await this.verifyPassword(password, user?.password)) {
      const payload: JwtPayload = { sub: user.id, type: Role.USER };
      return { user, accessToken: this.jwtService.sign(payload) };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async changePassword(email: string, password: string) {
    const user = await this.findOne(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if the new password is the same as the old one
    const isSamePassword = await this.verifyPassword(password, user.password);
    if (isSamePassword) {
      throw new UnauthorizedException(
        'New password cannot be the same as the old password',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.db.user.update({
      where: { email },
      data: { password: hashedPassword, passwordChanged: true },
    });
  }

  async findAll() {
    return this.db.user.findMany({});
  }

  async findOne(email: string) {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: Prisma.UserUpdateInput) {
    return this.db.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    return this.db.user.delete({
      where: { id },
    });
  }

  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
