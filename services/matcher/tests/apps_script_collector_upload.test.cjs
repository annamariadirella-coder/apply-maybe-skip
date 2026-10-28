const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../../collector/Code.gs'), 'utf8');
const byteLengthSource = source.match(/function utf8ByteLength_\(text\) \{[\s\S]*?\n\}/);
const chunkEndSource = source.match(/function utf8ChunkEnd_\(text,start,maxBytes\) \{[\s\S]*?\n\}/);
assert.ok(byteLengthSource, 'UTF-8 byte counter exists');
assert.ok(chunkEndSource, 'UTF-8 safe chunk boundary helper exists');
const context = {};
vm.runInNewContext(byteLengthSource[0] + '\n' + chunkEndSource[0] +
  '\nthis.byteLength=utf8ByteLength_;this.chunkEnd=utf8ChunkEnd_;', context);

test('UTF-8 byte length handles ASCII, accents, and surrogate pairs', () => {
  assert.equal(context.byteLength(''), 0);
  assert.equal(context.byteLength('JobOps'), 6);
  assert.equal(context.byteLength('città'), 6);
  assert.equal(context.byteLength('🌱'), 4);
});

test('large mixed-text uploads split on UTF-8-safe Drive chunk boundaries', () => {
  const text = 'Aé🌱'.repeat(1200000);
  const total = context.byteLength(text);
  const limit = 8 * 1024 * 1024;
  let start = 0, bytes = 0, chunks = 0;
  while (start < text.length) {
    const end = context.chunkEnd(text, start, limit);
    assert.ok(end > start);
    assert.ok(end === text.length || context.byteLength(text.slice(start, end)) % (256 * 1024) === 0);
    assert.ok(!(text.charCodeAt(end - 1) >= 0xD800 && text.charCodeAt(end - 1) <= 0xDBFF));
    const size = context.byteLength(text.slice(start, end));
    assert.ok(size <= limit);
    bytes += size;
    start = end;
    chunks++;
  }
  assert.ok(chunks > 1);
  assert.equal(bytes, total);
});

test('collector output uses authenticated resumable Drive uploads with bounded chunks', () => {
  assert.match(source, /uploadType=resumable/);
  assert.match(source, /X-Upload-Content-Length/);
  assert.match(source, /Content-Range/);
  assert.match(source, /code!==308/);
  assert.match(source, /uploadDriveContent_\(id,content,mime\);/);
});
