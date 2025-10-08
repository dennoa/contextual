import { Module } from '@nestjs/common';
import { DbClient } from './db-client';
import { CollectionsController } from './collections.controller';

@Module({
  providers: [DbClient],
  controllers: [CollectionsController],
})
export class DbClientModule {}
