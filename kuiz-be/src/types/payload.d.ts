import { Role } from 'src/enum/role.enum';

export type JwtPayload = {
  sub: string;
  type: Role;
  iat?: number;
  exp?: number;
};
