import { Body, Controller, Get, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guards";
import type { AuthenticatedRequest } from "../auth/types/authenticated-request";
import { UsersService } from "./users.service";
import { UpdateUserProfileDto } from "./dto/update-user-profile.dto";
import { FindUserByEmailDto } from "./dto/find-user-by-email.dto";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  me(@Req() req: AuthenticatedRequest) {
    return this.usersService.findById(req.user.id);
  }

  // Localiza um usuário por e-mail exato — usado pelo admin ao adicionar um
  // membro a um racha (RF02.3), quando ainda não sabe o userId de quem quer
  // convidar.
  @Get()
  findByEmail(@Query() query: FindUserByEmailDto) {
    return this.usersService.findByEmail(query.email);
  }

  @Patch("me")
  updateProfile(@Req() req: AuthenticatedRequest, @Body() dto: UpdateUserProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }
}
