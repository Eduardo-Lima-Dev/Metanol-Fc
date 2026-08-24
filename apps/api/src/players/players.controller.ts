import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guards";
import { RachaAdminGuard, RachaMemberGuard } from "src/racha/guards/racha-role.guard";
import { PlayersService } from "./players.service";
import { UpdatePlayerStatsDto } from "./dto/update-player-stats.dto";
import { AddGuestPlayerDto } from "./dto/add-guest-player.dto";

@Controller("rachas/:rachaId/players")
@UseGuards(JwtAuthGuard)
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  @UseGuards(RachaMemberGuard)
  list(@Param("rachaId") rachaId: string) {
    return this.playersService.listPlayers(rachaId);
  }

  @Patch(":playerId/stats")
  @UseGuards(RachaAdminGuard)
  updateStats(
    @Param("rachaId") rachaId: string,
    @Param("playerId") playerId: string,
    @Body() dto: UpdatePlayerStatsDto,
  ) {
    return this.playersService.updateStats(rachaId, playerId, dto);
  }

  @Post("guests")
  @UseGuards(RachaAdminGuard)
  addGuestPlayer(@Param("rachaId") rachaId: string, @Body() dto: AddGuestPlayerDto) {
    return this.playersService.addGuestPlayer(rachaId, dto);
  }

  @Post("import-averages")
  @UseGuards(RachaAdminGuard)
  @UseInterceptors(FileInterceptor("file"))
  importAverages(
    @Param("rachaId") rachaId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException("Arquivo .txt não enviado");
    return this.playersService.importAverages(rachaId, file.buffer.toString("utf-8"));
  }
}
