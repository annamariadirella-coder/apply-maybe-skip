const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../../collector/Code.gs'), 'utf8');

test('run manifest captures output commit identity and timestamps', () => {
  const match = source.match(/function buildRunManifest_\([\s\S]*?\n}/);
  assert.ok(match, 'manifest builder exists');
  const context = {};
  vm.runInNewContext(match[0] + '\nresult = buildRunManifest_("run-123", "start", "checked", "done", "v1");', context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.result)), {
    schema_version: 1,
    status: 'outputs_committed',
    run_id: 'run-123',
    run_started_at: 'start',
    checked_at: 'checked',
    completed_at: 'done',
    collector_version: 'v1',
    outputs: ['processed_jobs.json', 'candidates.json', 'candidates.md']
  });
});

test('report and safe output allowlist support run correlation', () => {
  assert.match(source, /run_id:runId,run_started_at:runStartedAt/);
  assert.match(source, /'candidates\\.json','candidates\\.md','processed_jobs\\.json','run_manifest\\.json'/);
});

test('manifest is written last after each declared output', () => {
  const manifestIndex = source.lastIndexOf("writeOutput(config,'run_manifest.json'");
  assert.notEqual(manifestIndex, -1);
  for (const name of ['processed_jobs.json', 'candidates.json', 'candidates.md']) {
    assert.ok(source.lastIndexOf("writeOutput(config,'" + name + "'") < manifestIndex, name + ' is saved before manifest');
  }
});
