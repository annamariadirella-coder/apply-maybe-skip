import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseProfileIntent} from '../core/profile-intent.js';
import {buildCandidateProfile} from '../apps/extension/src/profile/profile-settings.js';
import {importPacket} from '../core/jobs.js';
import {buildShortlist} from '../core/shortlist.js';

test('public page, retained catchup, intent profile and shortlist retain verification boundaries',()=>{
 const ctx=vm.createContext({console});
 vm.runInContext(fs.readFileSync(new URL('../services/collector/Code.gs',import.meta.url),'utf8'),ctx);
 vm.runInContext(`Date.now=()=>Date.parse('2026-10-15T12:00:00Z');discoverFeed=()=>({jobs:[],pages:1,truncated:false});
 var registry=[{url:'https://fictional-integrated.notion.site/operations',company:'Fictional Integrated',title:'Senior Product Operations Lead',location:'Berlin',published_at:'2026-09-01T12:00:00Z',text:'Lead Product Operations, workflow automation and cross-functional process improvement. '.repeat(5)+'<a href="https://jobs.ashbyhq.com/fictional-integrated/abc">Apply</a>'}];
 var config={PUBLIC_RECRUITING_SOURCES:JSON.stringify(registry),DISCOVERY_CATCHUP_DAYS:'30'},state={};
 var first=marketDiscovery(new Set(),{},state,config);config.DISCOVERY_CATCHUP_DAYS='60';var second=marketDiscovery(new Set(),{},state,config);`,ctx);
 const get=s=>JSON.parse(vm.runInContext(`JSON.stringify(${s})`,ctx));
 assert.equal(get('first.leads.length'),0);assert.equal(get('first.catchup.outside_window_retained'),1);
 assert.equal(get('second.leads.length'),1);assert.equal(get('state.discovered_boards.length'),1);
 const packet=importPacket({candidates:[],discovery_leads:get('second.leads')});
 assert.equal(packet.jobs.length,0);
 const base=JSON.parse(fs.readFileSync(new URL('../examples/demo.json',import.meta.url)));
 const settings={...base.profile,...parseProfileIntent('Cerco Product Operations. Preferisco lavorare a Berlin. Parlo English.').suggestions};
 const unsafe=importPacket({candidates:get('second.leads')}).jobs;
 const list=buildShortlist(unsafe,buildCandidateProfile(settings),settings,{now:Date.parse('2026-10-15T12:00:00Z')});
 assert.equal(list.strong.length,0);assert.equal(list.wildcards.length,0);
 assert.equal(get('second.leads[0].source_capture_method'),'pasted_text');
 assert.equal(get('second.leads[0].employer_live_verified'),false);
});
