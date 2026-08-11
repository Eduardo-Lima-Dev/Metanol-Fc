import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new UnauthorizedException('Email ou senha invalidos');

    const validate = await bcrypt.compare(password, user.passwordHash);

    if (!validate) throw new UnauthorizedException('Email ou senha invalidos');

    return this.jwt.sign({ sub: user.id, email: user.email });
  }

  async register(
    name: string,
    nickname: string | undefined,
    email: string,
    password: string,
  ) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail)
      throw new ConflictException('O e-mail informado já está em uso.');

    try {
      const user = await this.prisma.user.create({
        data: {
          name,
          ...(nickname ? { nickname } : {}),
          email,
          passwordHash: await bcrypt.hash(password, 12),
        },
      });
      return this.jwt.sign({ sub: user.id, email: user.email });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        const fields = (err.meta?.target as string[] | undefined) ?? [];
        if (fields.includes('nickname')) {
          throw new ConflictException('O nickname informado já está em uso.');
        }
        if (fields.includes('email')) {
          throw new ConflictException('O e-mail informado já está em uso.');
        }
        throw new ConflictException('Dados duplicados detectados.');
      }
      throw err;
    }
  }
}
