import { Test, TestingModule } from '@nestjs/testing';
import { DbClient } from './db-client';

describe('DbClient', () => {
  let provider: DbClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbClient],
    }).compile();

    provider = module.get<DbClient>(DbClient);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
