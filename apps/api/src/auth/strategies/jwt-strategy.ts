import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET não definido no .env');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => req?.cookies?.token ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * DECISÃO MVP: validate() não consulta o banco para verificar se o usuário
   * ainda existe. Um token emitido para um usuário deletado permanecerá válido
   * até seu vencimento (8 h). Aceitável no escopo atual; quando houver
   * revogação de sessão, substituir por uma consulta ao banco ou lista negra
   * de tokens (Redis/DB).
   */
  async validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}
