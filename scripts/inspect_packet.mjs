import fs from 'node:fs';
import {inspectPacket} from '../core/report-contract.js';
const [file,scanStartedAt,third,fourth]=process.argv.slice(2);
const scheduled=third==='--scheduled-snapshot'||fourth==='--scheduled-snapshot';
const expectedRunId=scheduled?null:(third==='--scheduled-snapshot'?null:third||null);
if(!file||!scanStartedAt){console.error('Usage: node scripts/inspect_packet.mjs LOCAL_JSON SCAN_STARTED_AT [RUN_ID | --scheduled-snapshot]');process.exitCode=2;}
else {try {const result=inspectPacket(JSON.parse(fs.readFileSync(file,'utf8')),{scanStartedAt,expectedRunId,mode:scheduled?'scheduled_snapshot':'requested_run'});console.log(JSON.stringify(result,null,2));process.exitCode=['READY','SNAPSHOT_AVAILABLE'].includes(result.status)?0:1;}catch{console.error('Invalid packet or arguments. No state changed.');process.exitCode=2;}}
