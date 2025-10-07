import { Test, TestingModule } from '@nestjs/testing';
import { DbClientController } from './db-client.controller';
import { DbClient } from './db-client';

describe('DbClientController', () => {
  let controller: DbClientController;
  let dbClientMock: { getClient: jest.Mock };

  beforeEach(async () => {
    dbClientMock = { getClient: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DbClientController],
      providers: [{ provide: DbClient, useValue: dbClientMock }],
    }).compile();

    controller = module.get<DbClientController>(DbClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list collections', async () => {
    const collections = [{ name: 'TEST1' }, { name: 'TEST2' }];
    const clientMock = {
      collections: {
        listAll: jest.fn().mockResolvedValue(collections),
      },
    };
    dbClientMock.getClient.mockResolvedValue(clientMock);

    const result = await controller.listCollections();
    expect(result).toEqual(['TEST1', 'TEST2']);
    expect(clientMock.collections.listAll).toHaveBeenCalled();
  });

  it('should create a collection if it does not exist', async () => {
    const dto = { name: 'testcollection' };
    const clientMock = {
      collections: {
        exists: jest.fn().mockResolvedValue(false),
        create: jest.fn().mockResolvedValue(undefined),
      },
    };
    dbClientMock.getClient.mockResolvedValue(clientMock);

    const result = await controller.createCollection(dto);
    expect(result).toEqual({ name: 'TESTCOLLECTION' });
    expect(clientMock.collections.exists).toHaveBeenCalledWith('TESTCOLLECTION');
    expect(clientMock.collections.create).toHaveBeenCalled();
  });

  it('should not create a collection if it already exists', async () => {
    const dto = { name: 'existingcollection' };
    const clientMock = {
      collections: {
        exists: jest.fn().mockResolvedValue(true),
        create: jest.fn(),
      },
    };
    dbClientMock.getClient.mockResolvedValue(clientMock);

    const result = await controller.createCollection(dto);
    expect(result).toEqual({ name: 'EXISTINGCOLLECTION' });
    expect(clientMock.collections.exists).toHaveBeenCalledWith('EXISTINGCOLLECTION');
    expect(clientMock.collections.create).not.toHaveBeenCalled();
  });

  it('should delete a collection if it exists', async () => {
    const name = 'deletethis';
    const clientMock = {
      collections: {
        exists: jest.fn().mockResolvedValue(true),
        delete: jest.fn().mockResolvedValue(undefined),
      },
    };
    dbClientMock.getClient.mockResolvedValue(clientMock);

    const result = await controller.deleteCollection(name);
    expect(result).toEqual({ name: 'DELETETHIS' });
    expect(clientMock.collections.exists).toHaveBeenCalledWith('DELETETHIS');
    expect(clientMock.collections.delete).toHaveBeenCalledWith('DELETETHIS');
  });

  it('should not delete a collection if it does not exist', async () => {
    const name = 'nonexistent';
    const clientMock = {
      collections: {
        exists: jest.fn().mockResolvedValue(false),
        delete: jest.fn(),
      },
    };
    dbClientMock.getClient.mockResolvedValue(clientMock);

    const result = await controller.deleteCollection(name);
    expect(result).toEqual({ name: 'NONEXISTENT' });
    expect(clientMock.collections.exists).toHaveBeenCalledWith('NONEXISTENT');
    expect(clientMock.collections.delete).not.toHaveBeenCalled();
  });
});
