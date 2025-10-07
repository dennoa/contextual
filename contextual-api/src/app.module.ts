import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbClientModule } from './db-client/db-client.module';
import { DbClient } from './db-client/db-client';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DbClientModule],
  controllers: [AppController],
  providers: [AppService, DbClient],
})
export class AppModule {}
