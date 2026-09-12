export type AgentStep = "idle" | "parsing" | "planning" | "critiquing" | "executing" | "validating" | "analyzing" | "retrying" | "completed" | "error";
export type TabId = "code" | "output" | "spec" | "stats";

export interface SimulationResult {
  status?: string;
  // Phase 1 — Specification
  simulation_spec?: string;
  // Phase 2 — Code
  plan?: string;
  code?: string;
  critic_feedback?: string;
  critic_approved?: boolean;
  // Phase 3 — Execution
  output?: string;
  error?: string;
  structured_results?: string;
  // Phase 4 — Validation
  validation_report?: string;
  // Phase 5 — Statistics
  statistical_summary?: string;
  // Phase 6 — Report
  report?: string;
}