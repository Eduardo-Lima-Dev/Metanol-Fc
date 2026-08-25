import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { ConfigService } from "@nestjs/config"
import { Request } from "express"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
        const secret = config.get<string>('JWT_SECRET')
        if (!secret) throw new Error('JWT_SECRET não definido no .env')

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                (req: Request) => req?.cookies?.token ?? null,
            ]),
            ignoreExpiration: false,
            secretOrKey: secret,
        })
    }

    validate(payload: { sub: string; email: string }) {
        return { id: payload.sub, email: payload.email }
    }
}