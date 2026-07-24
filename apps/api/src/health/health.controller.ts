import { Controller, Get } from "@nestjs/common";

@Controller('health')
export class HealthController {
    @Get()
    chack() {
        return {
            message: "OK"
        }
    }
}