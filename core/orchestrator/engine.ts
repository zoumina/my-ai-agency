import type { WorkflowContext, WorkflowStatus } from "./types.js";

export interface WorkflowStep {
  id: string;
  run: (context: WorkflowContext) => Promise<void>;
}

export class WorkflowEngine {
  async execute(context: WorkflowContext, steps: WorkflowStep[]): Promise<WorkflowContext> {
    let current: WorkflowContext = { ...context, status: "running" };
    try {
      for (const step of steps) {
        current = { ...current, currentStep: step.id };
        await step.run(current);
      }
      return { ...current, status: "completed", currentStep: undefined };
    } catch (error) {
      return { ...current, status: "failed", metadata: { ...current.metadata, error: String(error) } };
    }
  }
}