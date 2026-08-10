import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const contactTypesPath = resolve(projectRoot, 'src/types/contact.ts');
const contactPagePath = resolve(projectRoot, 'src/modules/Marketing/view/contact/index.vue');

const contactTypesSource = readFileSync(contactTypesPath, 'utf8');
const transpiled = ts.transpileModule(contactTypesSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: contactTypesPath,
});
const module = { exports: {} };
const executeModule = new Function('exports', 'module', 'require', transpiled.outputText);
executeModule(module.exports, module, createRequire(import.meta.url));

const { resolveContactId } = module.exports;
assert.equal(
  typeof resolveContactId,
  'function',
  'Contact replies need one resolver for API records from different backend versions'
);
assert.equal(
  resolveContactId({ id: 41, contactId: 57, contact: { id: 57 } }),
  57,
  'The explicit ContactId must take priority over the inbox item id'
);
assert.equal(
  resolveContactId({ id: 41, contact: { id: 57 } }),
  57,
  'A nested Contact id must support list responses that omit the top-level ContactId'
);
assert.equal(
  resolveContactId({ id: 41 }),
  null,
  'The inbox item id must never be sent as a Contact id'
);

const contactPageSource = readFileSync(contactPagePath, 'utf8');
assert.match(
  contactPageSource,
  /resolveContactId\(contactStore\.activeItem\)/,
  'The contact page must resolve the persistent Contact id before replying'
);
assert.match(
  contactPageSource,
  /contactStore\.activeItem\.id,\s*activeTab\.value/,
  'The reply action must send inbox item context so the backend can repair orphaned Contact data'
);
assert.doesNotMatch(
  contactPageSource,
  /sendReply\(\s*contactStore\.activeItem\.contactId/,
  'The reply action must not assume every API version returns a top-level ContactId'
);

console.log('Contact reply routing regression checks passed.');
