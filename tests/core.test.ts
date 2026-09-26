import test from "node:test";
import assert from "node:assert/strict";
import { GovernanceEngine } from "../core/governance/engine.js";
import { CompanyMemoryStore } from "../core/memory/store.js";

test("governance requires approval for outbound email", () => {
  const engine = new GovernanceEngine({
    maxAutonomousRisk: "medium",
    requireApprovalForOutboundEmail: true,
    emergencyStop: false
  });
  const decision = engine.decide("email.send", "low", "outreach-agent");
  assert.equal(decision.allowed, true);
  assert.equal(decision.requiresHumanApproval, true);
});

test("suppression is persisted in company memory", () => {
  const store = new CompanyMemoryStore();
  store.upsert({ companyId: "c1", legalName: "Example", suppressed: false, sources: [] });
  store.suppress("c1");
  assert.equal(store.get("c1")?.suppressed, true);
});
