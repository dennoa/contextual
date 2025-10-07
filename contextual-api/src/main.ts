import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DbClient } from './db-client/db-client';

const port = parseInt(process.env.CONTEXTUAL_PORT ?? '3000');
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const client = await app.get(DbClient).getClient();
  const collections = await client.collections.listAll();
  collections.forEach((col) => Logger.log(`Found collection: ${col.name}`));
  if (collections.length === 0) {
    Logger.log('No database collections found');
  }
  if (process.env.CONTEXTUAL_CORS_ORIGIN) {
    app.enableCors({ origin: process.env.CONTEXTUAL_CORS_ORIGIN });
  }
  await app.listen(port);
}
bootstrap()
  .then(() => {
    Logger.log(`Listening on port: ${port}`);
  })
  .catch((err: Error) => {
    Logger.error(`Bootstrap failed: ${err.message}`, err);
  });
