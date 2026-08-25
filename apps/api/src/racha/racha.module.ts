import { Module } from "@nestjs/common";
import { PlayersModule } from "src/players/players.module";
import { RachaController } from "./racha.controller";
import { RachaService } from "./racha.service";

@Module({
  imports: [PlayersModule],
  controllers: [RachaController],
  providers: [RachaService],
})
export class RachaModule {}
