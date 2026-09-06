import path from 'node:path';
import { bundle, load, safePath } from './files.mjs';

// Deliberately limited to the keywords used by our bundled schemas.
// Fail closed if a schema introduces a keyword this validator cannot enforce.
const keywords = new Set(['$schema', 'title', 'type', 'required', 'properties',
  'additionalProperties', 'propertyNames', 'const', 'enum', 'uniqueItems', 'items', 'pattern']);
function validate(value, schema, at) {
  for (const key of Object.keys(schema)) {
    if (!keywords.has(key)) throw new Error(`Unsupported schema keyword: ${key}`);
  }
  const fail = message => { throw new Error(`Invalid ${at}: ${message}`); };
  const type = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
  if (schema.type && type !== schema.type) fail(`expected ${schema.type}`);
  if ('const' in schema && value !== schema.const) fail(`expected ${schema.const}`);
  if (schema.enum && !schema.enum.includes(value)) fail('unsupported value');
  if (typeof value === 'string' && schema.pattern && !new RegExp(schema.pattern).test(value)) fail('invalid format');
  if (type === 'array') {
    if (schema.uniqueItems && new Set(value.map(v => JSON.stringify(v))).size !== value.length) fail('duplicate items');
    if (schema.items) value.forEach((v, i) => validate(v, schema.items, `${at}[${i}]`));
  }
  if (type === 'object') {
    for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) fail(`missing ${key}`);
    for (const [key, item] of Object.entries(value)) {
      if (schema.propertyNames) validate(key, schema.propertyNames, `${at} key ${key}`);
      if (Object.hasOwn(schema.properties ?? {}, key)) validate(item, schema.properties[key], `${at}.${key}`);
      else if (schema.additionalProperties === false) fail(`unknown field ${key}`);
      else if (typeof schema.additionalProperties === 'object') validate(item, schema.additionalProperties, `${at}.${key}`);
    }
  }
  return value;
}

export function validateDocument(value, name) {
  return validate(value, load(path.join(bundle, 'schemas', `${name}.v1.schema.json`)), name);
}

export function validateLock(root, lock) {
  validateDocument(lock, 'lock');
  for (const key of Object.keys(lock.files)) safePath(root, key);
  return lock;
}
