import { Injectable } from '@nestjs/common';
import weaviate, { WeaviateClient } from 'weaviate-client';

@Injectable()
export class DbClient {
  private client: WeaviateClient;

  async getClient(): Promise<WeaviateClient> {
    if (!this.client) {
      const client = await weaviate.connectToLocal();
      const isReady = await client.isReady();
      if (!isReady) {
        await client.close();
        throw new Error('Weaviate is not ready');
      }
      this.client = client;
    }
    return this.client;
  }
}
