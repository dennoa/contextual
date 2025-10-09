import { FilterTarget } from 'node_modules/weaviate-client/dist/node/cjs/proto/v1/base';
import { Operator } from 'weaviate-client';

export function whereSource(source: string) {
  const operator: Operator = 'Equal';
  const target: FilterTarget = { property: 'source' };
  return { operator, target, value: source };
}
