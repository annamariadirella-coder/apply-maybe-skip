import test from 'node:test';
import assert from 'node:assert/strict';
import {coverageSummary, planSourceBatch, recordSourceOutcome} from './coverage.js';

test('rotates enabled sources and advances the cursor', () => {
  const sources=[{id:'a'},{id:'b'},{id:'c'},{id:'d',enabled:false}];
  const plan=planSourceBatch(sources,{cursor:1},2,'2026-10-23T10:00:00Z');
  assert.deepEqual(plan.batch.map(source=>source.id),['b','c']);
  assert.equal(plan.next_cursor,0);
  assert.equal(plan.eligible_count,3);
});

test('records retryable failures without treating them as empty sources', () => {
  const source=recordSourceOutcome({id:'a'}, {status:'timeout',error:'network timeout'}, '2026-10-23T10:00:00Z');
  assert.equal(source.last_status,'timeout');
  assert.ok(source.retry_after);
  assert.equal(coverageSummary([source]).unavailable,1);
});

test('coverage distinguishes complete, partial and untested sources', () => {
  const summary=coverageSummary([{id:'a',last_checked_at:'x',last_status:'ok'},{id:'b'},{id:'c',last_checked_at:'x',last_status:'404'}]);
  assert.deepEqual(summary,{total:3,enabled:3,checked:2,successful:1,unavailable:1,untested:1,complete:false});
});
