import { createZodDto } from "nestjs-zod";
import { importAveragesTextSchema } from "@metanol/shared";

export class ImportAveragesTextDto extends createZodDto(importAveragesTextSchema) {}
