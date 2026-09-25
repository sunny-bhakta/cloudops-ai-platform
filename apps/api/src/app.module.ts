import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module.js';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),

		AiModule,
	],
	controllers: [HealthController],
})
export class AppModule { }
