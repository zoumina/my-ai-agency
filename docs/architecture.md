# Architecture

## Control plane
Command Center provides visibility and controlled operations. The Orchestrator owns workflow state and delegates work to specialized agents.

## AI layer
Claude is the sole reasoning/model layer. External services are tools, not additional autonomous brains.

## Core domains
- orchestrator
- governance
- permissions
- memory
- events
- workflows
- self-healing
- audit

## Specialized agents
Research, verification, opportunity, decision-maker research, outreach, conversation, pricing, proposal, negotiation, project, website engineering, GitHub engineering, testing, deployment, learning, and reporting.

## Main workflow
START → Market Intelligence → Find Companies → Research → Verify → Website Audit → Opportunity Score → Contact Discovery → Company 360 Memory → Rank → Personalized Email → Governance → Gmail → Reply → Conversation → Pricing/Proposal/Negotiation → Agreement → Project → Requirements → Website Factory → GitHub → Build → Test → Fix → Deploy → Monitor → Report.

## Safety
Every high-risk action must pass governance. Outbound email starts approval-required. Protected branches, least privilege, audit logs, rollback, and emergency stop are mandatory.
