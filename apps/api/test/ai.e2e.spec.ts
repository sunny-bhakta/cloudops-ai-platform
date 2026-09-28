import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { LLM_PROVIDER } from '../src/ai/provider/llm.provider.js';

describe('Health and AI endpoints (e2e)', () => {
	let app: INestApplication | undefined;

	const getAppOrThrow = (): INestApplication => {
		if (!app) {
			throw new Error('Test app was not initialized');
		}

		return app;
	};

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(LLM_PROVIDER)
			.useValue({
				chat: async () => ({
					content: 'Hello from mock provider',
					toolCalls: [],
				}),
			})
			.compile();

		app = moduleRef.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		if (app) {
			await app.close();
		}
	});

	it('GET /health returns ok status', async () => {
		const response = await request(getAppOrThrow().getHttpServer()).get('/health').expect(200);

		expect(response.body.status).toBe('ok');
		expect(response.body.service).toBe('cloudops-ai-platform-api');
		expect(typeof response.body.timestamp).toBe('string');
	});

	it('POST /ai/chat returns answer without tool (happy path)', async () => {
		const response = await request(getAppOrThrow().getHttpServer())
			.post('/ai/chat')
			.send({ message: 'Say hello' })
			.expect(201);

		expect(response.body.content).toBe('Hello from mock provider');
		expect(response.body.toolActions).toEqual([]);
		expect(typeof response.body.metadata?.requestId).toBe('string');
		expect(response.body.metadata?.safety).toBe('allowed');
	});

	it.todo('POST /ai/chat executes getServiceHealth tool when requested');
	it.todo('POST /ai/chat blocks unauthorized tool usage');
	it.todo('POST /ai/chat handles timeout/fallback path');
});