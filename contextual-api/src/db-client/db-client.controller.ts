import { Chunkly } from '@dennoa/chunkly';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { generative, vectors } from 'weaviate-client';
import type { Collection } from 'weaviate-client';
import { DbClient } from './db-client';
import { CreateCollectionDto } from './dto/create-collection.dto';

@Controller('db-client')
export class DbClientController {
  chunkly: Chunkly;
  constructor(private dbClient: DbClient) {
    this.chunkly = new Chunkly();
  }

  @Get('/collections')
  async listCollections() {
    const client = await this.dbClient.getClient();
    const collections = await client.collections.listAll();
    return collections.map((col) => col.name);
  }

  @Post('/collections')
  async createCollection(@Body() dto: CreateCollectionDto) {
    const name = dto.name.toUpperCase();
    const client = await this.dbClient.getClient();
    const exists = await client.collections.exists(name);
    if (!exists) {
      await client.collections.create({
        name,
        vectorizers: vectors.text2VecOllama({
          // Configure the Ollama embedding integration
          apiEndpoint: 'http://contextual-ollama:11434',
          model: 'nomic-embed-text',
        }),
        generative: generative.ollama({
          // Configure the Ollama generative integration
          apiEndpoint: 'http://contextual-ollama:11434',
          model: 'llama3.2',
        }),
      });
    }
    return { name };
  }

  getFileType(mimeType: string): 'docx' | 'html' | 'pdf' | 'txt' {
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
    if (mimeType === 'text/html') return 'html';
    if (mimeType === 'application/pdf') return 'pdf';
    return 'txt';
  }

  async deleteBySource(collection: Collection, source: string) {
    await collection.data.deleteMany({
      operator: 'Equal',
      path: ['source'],
      valueText: source,
    });
  }

  @Post('/collections/:name/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Param('name') anyName: string, @UploadedFile() file: Express.Multer.File) {
    const name = anyName.toUpperCase();
    const client = await this.dbClient.getClient();
    const exists = await client.collections.exists(name);
    if (!exists) {
      throw new NotFoundException(`Collection ${name} does not exist`);
    }
    const collection = client.collections.use(name);
    const type = this.getFileType(file.mimetype);
    const source = file.originalname;
    const chunks = await this.chunkly.chunkItUp({ buffer: file.buffer, source, type });
    await this.deleteBySource(collection, source);
    await collection.data.insertMany(chunks.map((chunk) => ({ ...chunk })));
    return { name, chunks };
  }

  @Delete('/collections/:name')
  async deleteCollection(@Param('name') anyName: string) {
    const name = anyName.toUpperCase();
    const client = await this.dbClient.getClient();
    const exists = await client.collections.exists(name);
    if (exists) {
      await client.collections.delete(name);
    }
    return { name };
  }
}
