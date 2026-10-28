import fs from 'node:fs';
import {inspectPacket} from '../core/report-contract.js';
const [file,scanStartedAt,expectedRunId]=process.argv.slice(2);
if(!file||!scanStartedAt){console.error('Usage: node scripts/inspect_packet.mjs LOCAL_JSON SCAN_STARTED_AT [EXPECTED_RUN_ID]');process.exitCode=2;}
else {try {const result=inspectPacket(JSON.parse(fs.readFileSync(file,'utf8')),{scanStartedAt,expectedRunId:expectedRunId||null});console.log(JSON.stringify(result,null,2));process.exitCode=result.status==='READY'?0:1;}catch{console.error('Invalid packet or arguments. No state changed.');process.exitCode=2;}}
