export type AgentStep = "idle" | "planning" | "executing" | "retrying" | "completed" | "error";
export type TabId = "code" | "output";

export interface SimulationResult {
  plan?: string;
  code?: string;
  output?: string;
  error?: string;
  report?: string;
}