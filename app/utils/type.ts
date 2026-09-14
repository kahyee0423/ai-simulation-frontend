export type AgentStep = "idle" | "parsing" | "planning" | "critiquing" | "executing" | "validating" | "analyzing" | "retrying" | "completed" | "error";
export type TabId = "code" | "output" | "spec" | "stats";

export interface SimulationResult {
  status?: string;
  simulation_spec?: string;       // Phase 1: Specification
  hypothesis_analysis?: string;   // Phase 1b: Bayesian belief table (JSON string)
  plan?: string;                  // Phase 2: Code
  code?: string;
  critic_feedback?: string;
  critic_approved?: boolean;
  output?: string;                // Phase 3: Execution
  error?: string;
  structured_results?: string;
  validation_report?: string;     // Phase 4: Validation
  statistical_summary?: string;   // Phase 5: Statistics
  report?: string;                // Phase 6: Report
  language?: string;              // Output language
}