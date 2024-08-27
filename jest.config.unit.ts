import 'dotenv/config.js';
import { JestConfigWithTsJest } from 'ts-jest';
import baseConfig from './jest.config.base';

const unitConfig: JestConfigWithTsJest = {
  ...baseConfig,
  displayName: 'unit',
  testMatch: ['<rootDir>/src/**/*.unit.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/lib/__mocks__/prisma.ts']
};

export default unitConfig;
