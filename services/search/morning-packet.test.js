import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeMorningPacket,morningPacketToWorkspacePacket} from './morning-packet.js';

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

test('does not present a no-update receipt as a fresh scan', () => {
  const packet=normalizeMorningPacket({status:'no_update',new_report:false,verified:[{decision:'APPLY',title:'Old role',company:'Acme',employer_url:'https://acme.example/jobs/1'}],to_verify:[{title:'Old lead',company:'Beta',url:'https://beta.example/jobs/1'}]});
  assert.equal(packet.new_report,false);
  assert.equal(packet.verified.length,0);
  assert.equal(packet.to_verify.length,0);
});

test('converts a verified Morning Desk packet into a private workspace import', () => {
  const result = morningPacketToWorkspacePacket({status:'completed',verified:[{decision:'MAYBE',company:'Acme',title:'Ops Lead',employer_url:'https://acme.example/jobs/1',reason:'Fit needs review.'}]});
  assert.equal(result.jobs.length, 1);
  assert.equal(result.jobs[0].employer_live_verified, true);
  assert.equal(result.jobs[0].description, 'Fit needs review.');
});
