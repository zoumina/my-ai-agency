import test from "node:test";
import assert from "node:assert/strict";
import {qualifyLead} from "../agents/lead-engine/quality.js";
import {verifyFact} from "../core/verification/facts.js";
import {ApprovalStore} from "../core/approvals/store.js";

test("quality rejects suppressed leads",()=>assert.equal(qualifyLead({companyId:"x",score:90,confidence:1,suppressed:true,hasReliableContact:true}),false));
test("verification requires multiple strong sources",()=>assert.equal(verifyFact([{fact:"x",source:"a",confidence:.9},{fact:"x",source:"b",confidence:.8}]).verified,true));
test("approval can be consumed only once",async()=>{
 const s=new ApprovalStore();
 const a=await s.create("outbound-email:x","medium");
 await s.approve(a.id);
 assert.ok(await s.markConsumed(a.id));
 assert.equal(await s.markConsumed(a.id),undefined);
});
