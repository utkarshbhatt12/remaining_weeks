import fs from 'node:fs';
import path from 'node:path';

const packageJsonPath = path.resolve(import.meta.dirname, '../package.json');
const manifestJsonPath = path.resolve(
  import.meta.dirname,
  '../public/manifest.json',
);

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const manifestJson = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf-8'));

if (manifestJson.version !== packageJson.version) {
  throw new Error(`Manifest "version" mismatch with package.json.`);
}

if (manifestJson.description !== packageJson.description) {
  throw new Error(`Manifest "description" mismatch with package.json.`);
}
