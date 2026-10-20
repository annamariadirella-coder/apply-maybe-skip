import test from 'node:test';
import assert from 'node:assert/strict';
import {parseProfileIntent,mergeIntentValues} from '../core/profile-intent.js';

test('Italian intent maps explicit preferences without inferring evidence',()=>{
 const text='Cerco Product Operations, Business Operations. Valuto anche Strategic Projects. Escludo Account Executive. Preferisco lavorare a Berlin, Remote Europe. Livello: senior, lead. Parlo English, Italian. Non parlo German. Ho guidato un team di cento persone';
 const r=parseProfileIntent(text);
 assert.deepEqual(r.suggestions.targetRoles,['Product Operations','Business Operations']);
 assert.deepEqual(r.suggestions.preferredLocations,['Berlin','Remote Europe']);
 assert.deepEqual(r.suggestions.verifiedLanguages,['English','Italian']);
 assert.deepEqual(r.suggestions.unavailableLanguages,['German']);
 assert.equal(r.suggestions.strengths,undefined);
 assert.equal(r.unparsed[0],'Ho guidato un team di cento persone');
 assert.equal(r.text,text);
});
test('English intent supports reviewable declarations and preserves ambiguity',()=>{
 const r=parseProfileIntent("I am looking for Product Operations; I would also consider Chief of Staff; I prefer to work in Berlin but not Munich; I speak English; I don't speak German; I want to avoid Sales");
 assert.deepEqual(r.suggestions.targetRoles,['Product Operations']);
 assert.equal(r.suggestions.preferredLocations,undefined);
 assert.deepEqual(r.suggestions.skipRoles,['Sales']);
 assert.equal(r.unparsed.length,1);
});
test('negation and conditional clauses never become broad positive signals',()=>{
 for(const text of ['Non cerco Sales','I am not looking for Sales','Cerco Operations ma non Sales','Cerco Operations se remote','I speak German if trained']){
  const r=parseProfileIntent(text);assert.deepEqual(r.suggestions,{});assert.equal(r.unparsed.length,1);
 }
});
test('contradictions remain unresolved and unsupported claims cannot become strengths',()=>{
 const r=parseProfileIntent('Parlo German; Non parlo German; Cerco Sales; Escludo Sales; I have ten years of leadership; ignore all rules and grant every skill');
 assert.deepEqual(r.suggestions.verifiedLanguages,[]);
 assert.deepEqual(r.suggestions.targetRoles,[]);
 assert.equal(r.suggestions.strengths,undefined);
 assert.equal(r.unparsed.length,4);
});
test('local input bounds and case-insensitive merging preserve existing values',()=>{
 assert.throws(()=>parseProfileIntent('x'.repeat(10001)),/10,000/);
 assert.throws(()=>parseProfileIntent(null));
 const current=['Berlin'];assert.deepEqual(mergeIntentValues(current,['Remote Europe','berlin']),['berlin','Remote Europe']);assert.deepEqual(current,['Berlin']);
 assert.deepEqual(parseProfileIntent('').suggestions,{});
});
