const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');

const canonical=fs.readFileSync('../collector/Code.gs','utf8');
const mirrored=fs.readFileSync('apps-script/Code.gs','utf8');
assert.equal(mirrored,canonical,'matcher test mirror must match canonical collector source');

const context=vm.createContext({console});
vm.runInContext(mirrored,context);
const run=source=>vm.runInContext(source,context);

const hour=60*60*1000;
assert.equal(run('validationRetryDelayMs_(1)'),6*hour);
assert.equal(run('validationRetryDelayMs_(2)'),12*hour);
assert.equal(run('validationRetryDelayMs_(3)'),24*hour);
assert.equal(run('validationRetryDelayMs_(99)'),7*24*hour);

const start=Date.parse('2026-10-28T00:00:00.000Z');
run(`var failed={validation_attempts:0};markValidationRetry_(failed,${start});`);
assert.equal(run('failed.validation_attempts'),1);
assert.equal(run('failed.validation_retry_after'),new Date(start+6*hour).toISOString());
assert.equal(run('failed.validation_last_error'),'validation_unavailable');
run(`markValidationRetry_(failed,${start+6*hour});`);
assert.equal(run('failed.validation_attempts'),2);
assert.equal(run('failed.validation_retry_after'),new Date(start+18*hour).toISOString());
run('clearValidationRetry_(failed);');
assert.equal(run('failed.validation_attempts'),undefined);
assert.equal(run('failed.validation_retry_after'),undefined);
assert.equal(run('failed.validation_last_error'),undefined);

run(`var pending={
  legacy:{title:'Head of Operations'},
  due:{title:'Head of Operations',validation_retry_after:new Date(${start+6*hour}).toISOString()},
  future:{title:'Head of Operations',validation_retry_after:new Date(${start+6*hour+1}).toISOString()},
  invalid:{title:'Head of Operations',validation_retry_after:'not-a-date'}
};`);
assert.deepEqual(JSON.parse(run(`JSON.stringify(pendingReviewOrder(pending,'weighted',${start+6*hour}))`)),['due','invalid','legacy']);
assert.deepEqual(JSON.parse(run(`JSON.stringify(pendingReviewOrder(pending,'weighted',${start+6*hour-1}))`)),['invalid','legacy']);
console.log('PASS: bounded exponential retry backoff, retry eligibility, legacy queue compatibility, clearing after recovery, and collector mirror parity.');
