import {JSDOM} from 'jsdom';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';import assert from 'node:assert/strict';
test('dashboard keeps demo separate and persists the collector-to-tracker flow',async()=>{
const root=fileURLToPath(new URL('..',import.meta.url));
const dom=new JSDOM(fs.readFileSync(root+'/apps/dashboard/index.html','utf8'),{url:'http://127.0.0.1:8765/apps/dashboard/'});
const {window}=dom;globalThis.document=window.document;globalThis.localStorage=window.localStorage;globalThis.FormData=window.FormData;globalThis.chrome=undefined;
window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};window.HTMLDialogElement.prototype.close=function(){this.open=false;};window.HTMLElement.prototype.scrollIntoView=function(){};
globalThis.fetch=async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(root+'/examples/demo.json','utf8'))});
const $=id=>document.getElementById(id);const wait=async condition=>{for(let i=0;i<100;i++){if(condition())return;await new Promise(r=>setTimeout(r,10));}throw new Error('UI did not settle: '+$('notice').textContent);};
await import(root+'/apps/dashboard/app.js');assert.equal($('total-count').textContent,'0');
$('demo-button').click();await wait(()=>$('total-count').textContent==='3');assert.match($('notice').textContent,/fictional/);assert.equal(localStorage.getItem('jobopsWorkspaceV1'),null);
$('jobs').firstChild.click();const demoSelect=$('detail-content').querySelector('select');demoSelect.value='Applied';demoSelect.dispatchEvent(new window.Event('change'));await wait(()=>$('applied-count').textContent==='1');$('detail-dialog').close();$('demo-button').click();await wait(()=>$('total-count').textContent==='0');assert.equal(localStorage.getItem('jobopsWorkspaceV1'),null);
$('setup-button').click();const packet=JSON.parse(fs.readFileSync(root+'/examples/demo.json','utf8'));for(const [name,value] of Object.entries(packet.profile))if(Array.isArray(value)&&$('profile-form').elements[name])$('profile-form').elements[name].value=value.join(', ');$('profile-form').dispatchEvent(new window.Event('submit',{cancelable:true}));await wait(()=>$('profile-dialog').open===false);assert.equal(JSON.parse(localStorage.getItem('candidateProfileSettings')).configured,true);
const raw={...packet.candidates[0],demo:false,employer_live_verified:true,live_checked_at:new Date().toISOString()};const upload=async(id,text)=>{Object.defineProperty($(id),'files',{value:[{size:text.length,text:async()=>text}],configurable:true});$(id).dispatchEvent(new window.Event('change'));};await upload('file-input',JSON.stringify({candidates:[raw],checked_at:raw.live_checked_at}));await wait(()=>$('total-count').textContent==='1');
$('jobs').firstChild.click();const select=$('detail-content').querySelector('select');select.value='Applied';select.dispatchEvent(new window.Event('change'));const notes=$('detail-content').querySelector('textarea');notes.value='Follow up Tuesday';notes.dispatchEvent(new window.Event('change'));await wait(()=>JSON.parse(localStorage.getItem('jobopsWorkspaceV1')).jobs[0].notes==='Follow up Tuesday');$('detail-dialog').close();await upload('file-input',JSON.stringify({candidates:[raw]}));await wait(()=>$('notice').textContent.includes('Imported'));assert.equal(JSON.parse(localStorage.getItem('jobopsWorkspaceV1')).jobs[0].status,'Applied');assert.equal($('applied-count').textContent,'1');
$('search').value='nonexistent';$('search').dispatchEvent(new window.Event('input'));assert.equal($('jobs').children.length,0);$('search').value='Northstar';$('search').dispatchEvent(new window.Event('input'));assert.equal($('jobs').children.length,1);
$('sources-nav').click();assert.equal($('coverage-dialog').open,true);assert.ok($('coverage-content').textContent.includes('Attempted'));
console.log('PASS dashboard DOM integration: demo isolation, own profile, collector import, persisted status/notes, rescan, search and coverage.');

});
