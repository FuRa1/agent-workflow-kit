#!/usr/bin/env node
import { execute } from '../lib/commands.mjs';

try {
  const result = execute(process.argv.slice(2));
  console.log(result.output);
  process.exitCode = result.code;
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
