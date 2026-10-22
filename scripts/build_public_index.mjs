import {mkdir, writeFile} from 'node:fs/promises';
import {buildPublicIndex} from '../services/search/build-index.js';

const args = process.argv.slice(2);
const outputAt = args.indexOf('--output');
const output = outputAt >= 0 ? args[outputAt + 1] : 'apps/search/data/jobs.json';
const reports = args.filter((arg, i) => arg !== '--output' && i !== outputAt + 1);
if (!reports.length || !output) {
  console.error('Usage: node scripts/build_public_index.mjs report.json [report2.json] [--output path]');
  process.exit(1);
}
const index = await buildPublicIndex(reports);
await mkdir(output.substring(0, output.lastIndexOf('/')) || '.', {recursive: true});
await writeFile(output, `${JSON.stringify(index, null, 2)}\n`);
console.log(`Wrote ${index.length} verified public roles to ${output}`);
