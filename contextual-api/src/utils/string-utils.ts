export function toPascalCase(str: string): string {
  return str
    .replace(/[_\- ]+/g, ' ')
    .replace(/\b\w/g, (w) => w.toUpperCase())
    .replace(/\s+/g, '');
}
