/**
 * Jest yalnızca saf-TS domain/mantık testleri için (RN/expo import eden
 * modüller test edilmez). Hafif tutulur; sadece devDependency'dir.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { strict: true, esModuleInterop: true, resolveJsonModule: true, types: ['jest'] } }],
  },
};
