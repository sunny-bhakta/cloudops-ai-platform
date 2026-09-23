import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module';

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
