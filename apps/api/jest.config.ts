import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/test'],
	moduleFileExtensions: ['ts', 'js', 'json'],
	testRegex: '.*\\.spec\\.ts$',
	verbose: true,
};

export default config;