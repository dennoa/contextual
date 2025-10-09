import { Chunkly } from '@dennoa/chunkly';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { generative, vectors } from 'weaviate-client';
import { DbClient } from './db-client';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { ListChunksDto } from './dto/list-chunks.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { ListChunksNearestDto } from './dto/list-chunks-nearest.dto';
import { Operator } from 'weaviate-client';
import { FilterTarget } from 'node_modules/weaviate-client/dist/node/cjs/proto/v1/base';
import { DeleteChunksBySourceDto } from './dto/delete-chunks-by-source.dto';
import { toPascalCase } from 'src/utils/string-utils';

@Controller('collections')
export class CollectionsController {
  chunkly: Chunkly;
  constructor(private dbClient: DbClient) {
    this.chunkly = new Chunkly();
  }

  @Get()
  async listCollections() {
    const client = await this.dbClient.getClient();
    const collections = await client.collections.listAll();
    return collections.map((col) => col.name);
  }

  async getCollectionClient(anyName: string) {
    const name = toPascalCase(anyName);
    const client = await this.dbClient.getClient();
    const exists = await client.collections.exists(name);
    return { name, client, exists };
  }

  @Post()
  async createCollection(@Body() dto: CreateCollectionDto) {
    const { name, client, exists } = await this.getCollectionClient(dto.name);
    if (!exists) {
      await client.collections.create({
        name,
        properties: [
          {
            name: 'text',
            dataType: 'text',
            description: 'Chunk text',
            indexSearchable: true,
          },
          {
            name: 'source',
            dataType: 'text',
            description: 'Document source (e.g. filename)',
            indexFilterable: true,
          },
          {
            name: 'ref',
            dataType: 'text',
            description: 'Document reference (e.g. page number or section heading)',
          },
          {
            name: 'chunkIdx',
            dataType: 'int',
            description: 'Chunk index in document',
          },
        ],
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

  @Post('/:name/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('name') anyName: string,
    @Body() dto: UploadFileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { name, client, exists } = await this.getCollectionClient(anyName);
    if (!exists) {
      throw new NotFoundException(`Collection ${name} does not exist`);
    }
    const docOpts = {
      type: this.getFileType(file.mimetype),
      source: file.originalname,
      buffer: file.buffer,
      sections: dto.sections,
    };
    const chunks = await this.chunkly.chunkItUp(docOpts);
    Logger.log(`Dry run: ${dto.dryRun}, ${typeof dto.dryRun}`);
    if (!dto.dryRun) {
      await this.deleteChunksBySource(anyName, { source: docOpts.source });
      const collection = client.collections.use(name);
      await collection.data.insertMany(chunks.map((chunk) => ({ ...chunk })));
    }
    return { name, chunks };
  }

  @Delete('/:name')
  async deleteCollection(@Param('name') anyName: string) {
    const { name, client, exists } = await this.getCollectionClient(anyName);
    if (exists) {
      await client.collections.delete(name);
    }
    return { name };
  }

  @Get('/:name/chunks')
  async listChunks(@Param('name') anyName: string, @Query() dto: ListChunksDto) {
    const { name, client, exists } = await this.getCollectionClient(anyName);
    if (!exists) {
      throw new NotFoundException(`Collection ${name} does not exist`);
    }
    const offset = dto.offset ?? 0;
    const limit = Math.min(dto.limit ?? 10, 100);
    const collection = client.collections.use(name);
    const chunks = await collection.query.fetchObjects({ offset, limit, returnMetadata: 'all' });
    return chunks;
  }

  @Get('/:name/neartext')
  async listChunksNearest(@Param('name') anyName: string, @Query() dto: ListChunksNearestDto) {
    const { name, client, exists } = await this.getCollectionClient(anyName);
    if (!exists) {
      throw new NotFoundException(`Collection ${name} does not exist`);
    }
    const offset = dto.offset ?? 0;
    const limit = Math.min(dto.limit ?? 10, 100);
    const collection = client.collections.use(name);
    const chunks = await collection.query.nearText(dto.text, { offset, limit, returnMetadata: 'all' });
    return chunks;
  }

  @Delete('/:name/chunks')
  async deleteChunksBySource(@Param('name') anyName: string, @Query() dto: DeleteChunksBySourceDto) {
    const { name, client, exists } = await this.getCollectionClient(anyName);
    if (exists) {
      const operator: Operator = 'Equal';
      const target: FilterTarget = { property: 'source' };
      const where = { operator, target, value: dto.source };
      const collection = client.collections.use(name);
      await collection.data.deleteMany(where);
    }
    return { name };
  }
}
