import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeMorningPacket} from './morning-packet.js';

test('normalizes the three morning sections and drops malformed records', () => {
  const packet=normalizeMorningPacket({scan_date:'2026-10-23',coverage:'partial',verified:[{decision:'APPLY',title:'Ops Lead',company:'Acme',employer_url:'https://acme.example/jobs/1',discovery_source:'ats'},{title:'Missing link',company:'Acme'}],to_verify:[{title:'Chief of Staff',company:'Beta',url:'https://hiringcafe.com/job/1',reason:'Employer source blocked'}],unavailable_sources:[{provider:'ashby',company:'Gamma',endpoint:'https://api.example',error:'timeout'}]});
  assert.equal(packet.verified.length,1);
  assert.equal(packet.verified[0].decision,'APPLY');
  assert.equal(packet.to_verify.length,1);
  assert.equal(packet.unavailable_sources[0].error,'timeout');
});

test('keeps uncertain records out of verified results', () => {
  const packet=normalizeMorningPacket({verified:[{decision:'MAYBE',title:'Role',company:'Acme',employer_url:'http://unsafe.example'}]});
  assert.equal(packet.verified.length,0);
});
