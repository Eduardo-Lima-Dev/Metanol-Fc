import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService
  ) { }

  async login(email: string, password: string) {
    const user = await this.prisma.users.findUnique({ where: { email } })

    if (!user) throw new UnauthorizedException("Email ou senha invalidos")

    const validate = await bcrypt.compare(password, user.password_hash)

    if (!validate) throw new UnauthorizedException("Email ou senha invalidos")

    return this.jwt.sign({ email: user.email })

  }

  async register(name: string, nickname: string | undefined, email: string, password: string) {
    const existing = await this.prisma.users.findUnique({ where: { email } })
    if (existing) throw new ConflictException('O e-mail informado já está em uso.')

    const user = await this.prisma.users.create({
      data: {
        name,
        ...(nickname ? { nickname } : {}),
        email,
        password_hash: await bcrypt.hash(password, 12)
      }
    })
    return this.jwt.sign({ email: user.email })
  }

}