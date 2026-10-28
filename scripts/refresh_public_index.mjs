import {readdir, mkdir, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {buildPublicIndex} from '../services/search/build-index.js';

async function jsonReports(dir) {
  const entries = await readdir(dir, {withFileTypes:true});
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await jsonReports(path));
    else if (entry.isFile() && entry.name.endsWith('.json')) files.push(path);
  }
  return files;
}

const args = process.argv.slice(2);
const reportsAt = args.indexOf('--reports-dir');
const outputAt = args.indexOf('--output');
const reportsDir = reportsAt >= 0 ? args[reportsAt + 1] : 'local-data/public-reports';
const output = outputAt >= 0 ? args[outputAt + 1] : 'apps/search/data/jobs.json';
const reports = await jsonReports(reportsDir);
const index = await buildPublicIndex(reports);
await mkdir(output.substring(0, output.lastIndexOf('/')) || '.', {recursive:true});
await writeFile(output, `${JSON.stringify(index, null, 2)}\n`);
console.log(`Refreshed ${index.length} verified public roles from ${reports.length} reports.`);
