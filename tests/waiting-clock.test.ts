import test from 'node:test';
import assert from 'node:assert/strict';
import { waitingAnchor } from '../src/client/waiting-clock.js';
const nodes = new Map([
 ['u1', {kind:'user',data:{time:1000}}],
 ['s1', {kind:'steering',data:{time:301000}}],
 ['s2', {kind:'steering',data:{time:305000}}],
 ['a1', {kind:'assistant-step',data:{time:302000}}],
 ['ctx', {kind:'context',data:{time:399000}}],
]);
const get=(key:string)=>nodes.get(key);
test('ordinary waiting starts at user input',()=>assert.deepEqual(waitingAnchor(['u1'],get),{key:'u1',time:1000}));
test('steering resets a five-minute-old turn to the new input',()=>assert.deepEqual(waitingAnchor(['u1','s1'],get),{key:'s1',time:301000}));
test('repeated steering resets even while the waiting indicator stays mounted',()=>assert.deepEqual(waitingAnchor(['u1','s1','s2'],get),{key:'s2',time:305000}));
test('assistant, context and tool rerenders do not reset waiting',()=>assert.deepEqual(waitingAnchor(['u1','s1','a1','ctx'],get),{key:'s1',time:301000}));
test('local echo resets immediately before steering admission',()=>assert.deepEqual(waitingAnchor(['u1'],get,[{requestId:'new',time:301000,placement:'next-step'}]),{key:'pending:new',time:301000}));
test('queued future turns and stale echoes cannot reset current waiting',()=>{
 assert.deepEqual(waitingAnchor(['u1','s1'],get,[{requestId:'q',time:400000,placement:'queued'}]),{key:'s1',time:301000});
 assert.deepEqual(waitingAnchor(['u1','s1'],get,[{requestId:'old',time:1000}]),{key:'s1',time:301000});
});
test('missing latest timestamp falls back to a new-input clock, not old history',()=>{
 assert.deepEqual(waitingAnchor(['u1','bad'],key=>key==='bad'?{kind:'steering',data:{}}:get(key)),{key:'bad',time:null});
 assert.deepEqual(waitingAnchor([],get),{key:'unresolved',time:null});
});
