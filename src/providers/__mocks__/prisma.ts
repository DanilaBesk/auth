import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';

import { prisma } from '#/providers/prisma.provider';

jest.mock('#/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>()
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
