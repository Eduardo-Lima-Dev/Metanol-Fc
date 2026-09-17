import { Module } from "@nestjs/common";
import { PlayersModule } from "../players/players.module";
import { RachaController } from "./racha.controller";
import { InviteRedirectController } from "./invite-redirect.controller";
import { RachaService } from "./racha.service";

@Module({
  imports: [PlayersModule],
  controllers: [RachaController, InviteRedirectController],
  providers: [RachaService],
})
export class RachaModule {}
