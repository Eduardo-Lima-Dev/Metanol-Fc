import { Body, Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guards";
import type { AuthenticatedRequest } from "src/auth/types/authenticated-request";
import { UsersService } from "./users.service";
import { UpdateUserProfileDto } from "./dto/update-user-profile.dto";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  me(@Req() req: AuthenticatedRequest) {
    return this.usersService.findById(req.user.id);
  }

  @Patch("me")
  updateProfile(@Req() req: AuthenticatedRequest, @Body() dto: UpdateUserProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }
}
