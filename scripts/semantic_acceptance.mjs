// Reproducible fictional acceptance set; no real profile or provider requests.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {parseProfileIntent} from '../core/profile-intent.js';
import {buildCandidateProfile} from '../apps/extension/src/profile/profile-settings.js';
import {importPacket} from '../core/jobs.js';
import {buildShortlist,semanticScore} from '../core/shortlist.js';
const [mode,dir]=process.argv.slice(2);
if(!['prepare','verify'].includes(mode)||!dir)throw new Error('Use prepare|verify OUTPUT_DIRECTORY');
const root=path.resolve(dir);
const base=JSON.parse(fs.readFileSync(new URL('../examples/demo.json',import.meta.url)));
const now='2026-10-15T12:00:00Z';
if(mode==='prepare'){
 fs.mkdirSync(root,{recursive:true});
 const intent='Cerco Product Operations, Business Operations. Valuto anche Implementation Lead. Preferisco lavorare a Berlin, Remote Europe. Livello: senior, lead. Parlo English. Non parlo German.';
 const settings={...base.profile,...parseProfileIntent(intent).suggestions,naturalLanguageIntent:intent};
 const make=(id,title,description,extra={})=>({id,company:'Fictional '+id,title,description,location:'Berlin',url:'https://example.org/acceptance/'+id,demo:false,employer_live_verified:true,live_checked_at:now,...extra});
 const direct=base.candidates[0].description;
 const jobs=[
  make('direct-en','Senior Product Operations Lead',direct),
  make('direct-it','Senior Product Operations Lead','Coordina le attività dei team Prodotto, Ingegneria e Assistenza clienti. Migliora i processi interni, automatizza i flussi di lavoro, raccogli feedback dai clienti e facilita la collaborazione tra funzioni. Guida il cambiamento organizzativo e l’adozione dei nuovi strumenti.'),
  make('paraphrase','Senior Business Operations Lead','Help different departments coordinate their work. Replace repetitive manual steps with reliable systems, simplify handoffs and use customer insights to improve how the organisation delivers products. Guide experienced teams through changes and evaluate results.'),
  make('adjacent','Senior Implementation Lead',base.candidates[1].description),
  make('unrelated','Senior Pastry Chef','Prepare cakes, bake sourdough bread, manage ovens and maintain food hygiene in a hotel pastry kitchen. Decorate desserts and plan seasonal menus, ingredients and recipes. Work early shifts with hospitality colleagues and train junior pastry cooks.'),
  make('german-conflict','Senior Product Operations Lead',direct+' Native-level German is required.'),
  make('stale','Senior Product Operations Lead',direct,{live_checked_at:'2020-01-01T00:00:00Z'}),
  make('public-unverified','Senior Product Operations Lead',direct,{provider:'public_document',employer_live_verified:false,requires_employer_verification:true}),
  make('late-passage','Senior Product Operations Lead',('A fictional company describes office facilities, annual social events and generic administrative notices. '.repeat(80))+direct),
 ];
 for(const [name,data] of [['profile.json',settings],['packet.json',{candidates:jobs}]])fs.writeFileSync(path.join(root,name),JSON.stringify(data,null,2),{flag:'wx'});
 console.log('Prepared nine fictional cases and an intent-derived profile.');
}else{
 const settings=JSON.parse(fs.readFileSync(path.join(root,'profile.json')));
 const packet=JSON.parse(fs.readFileSync(path.join(root,'ranked.json')));
 const jobs=importPacket(packet).jobs,profile=buildCandidateProfile(settings);
 const list=buildShortlist(jobs,profile,settings,{now:Date.parse(now)});
 const scores=Object.fromEntries(jobs.map(j=>[j.url.split('/').pop(),semanticScore(j,settings)]));
 const selected=[...list.strong,...list.wildcards].map(x=>x.job.url.split('/').pop());
 for(const id of ['german-conflict','stale','public-unverified'])assert(!selected.includes(id),'Unsafe shortlist inclusion: '+id);
 assert(list.strong.length<=3&&list.wildcards.length<=2);
 assert(Object.values(scores).every(x=>typeof x==='number'&&Number.isFinite(x)),'Python/JS snapshot mismatch');
 const pairs=['direct-en','direct-it','paraphrase'].map(id=>({preferred:id,over:'unrelated',passed:scores[id]>scores.unrelated}));
 const report={fictional:true,model_version:packet.candidates[0].semantic.model_version,scores,preference_pairs:pairs,preference_pair_passes:pairs.filter(p=>p.passed).length,preference_pair_total:pairs.length,guardrail_cases_passed:3,strong:list.strong.map(x=>x.job.url.split('/').pop()),wildcards:list.wildcards.map(x=>x.job.url.split('/').pop()),fit_assessed:false,limitation:'Nine synthetic cases; not a validated job-fit benchmark or real candidate evaluation.'};
 fs.writeFileSync(path.join(root,'acceptance.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
}
