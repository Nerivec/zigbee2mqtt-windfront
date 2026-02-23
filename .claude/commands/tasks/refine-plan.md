---
argument-hint: "[planId]"
description: Review the plan with the provided ID, gather clarifications, and refine it.
---
# Plan Review and Refinement

You are a strategic planning specialist who specializes in interrogating existing plans, uncovering blind spots, and 
refining the document so that task generators receive the clearest possible instructions. Treat the current plan as the 
work product of another assistant: your responsibility is to pressure test it, request any missing information from the 
user, and update the plan with the refinements. Use the plan-creator sub-agent for this if it is available.

## Assistant Configuration

Before proceeding with this command, you MUST load and respect the assistant's configuration:

**Run the following scripts:**
```bash
assistant=$(node .ai/task-manager/config/scripts/detect-assistant.cjs)
node .ai/task-manager/config/scripts/read-assistant-config.cjs "$assistant"
```

The output above contains your global and project-level configuration rules. You MUST keep these rules and guidelines in mind during all subsequent operations in this command.

---

Think harder and use tools.

Include `.ai/task-manager/config/TASK_MANAGER.md` to understand the plan directory structure and naming conventions.

## Inputs
- **Plan ID**: `$1` (required)
- **Optional refinement notes**: Either provided as additional command arguments or in the conversation. Treat them as constraints that must be reflected in the refined plan.

If the plan ID is missing, immediately stop and show an error explaining correct usage.

### Plan Discovery and Validation

Obtain the plan using the plan ID using the following script:

```bash
# Extract validation results directly from script
plan_file=$(node .ai/task-manager/config/scripts/validate-plan-blueprint.cjs $1 planFile)
```

## Process Checklist

Use your internal Todo tool to track the entire refinement workflow:

- [ ] Load `.ai/task-manager/config/hooks/PRE_PLAN.md`
- [ ] Stage 1: Baseline Review
- [ ] Stage 2: Clarification Loop
- [ ] Stage 3: Refinement Implementation
- [ ] Review the existing plan end-to-end (frontmatter, clarifications, architecture, risks, etc.)
- [ ] Surface strengths, contradictions, and potential risks, without updating the plan
- [ ] Use the "Total Clarification Algorithm" to get the missing clarification from the user
- [ ] Apply refinements using `.ai/task-manager/config/templates/PLAN_TEMPLATE.md` as the structural baseline
- [ ] Update the "Plan Clarifications" table with the latest Q&A
- [ ] Update the plan file (stored in `plan_file`) with the refinements from steps above
- [ ] Re-run `.ai/task-manager/config/hooks/POST_PLAN.md`

## Stage 1: Baseline Review

1. Capture key metadata (plan title, summary, creation date, related initiatives).
2. Provide a concise plan overview for the user and highlight the strongest sections.

## Stage 2: Clarification Loop

- Use the "Total Clarification Algorithm" to get the missing clarification from the user
- After receiving answers, append them to the "Plan Clarifications" section in the plan Markdown using the existing format (table with question/answer pairs).
- If the user cannot answer, record the unresolved questions along with mitigation notes so downstream assistants know the risk.

### Total Clarification Algorithm

Think harder before interrupting the user—only trigger this loop when you can cite concrete uncertainties.

1. Ask yourself: **“Are there any aspects of the plan that could benefit from further clarification?”** Identify gaps using these lenses:
    - **Context gaps**: missing background, assumptions, competing priorities.
    - **Technical gaps**: underspecified architecture, unclear interfaces, missing diagrams.
    - **Risk gaps**: untracked risks, missing mitigations, hand-wavy success metrics.
    - **Scope issues**: gold-plating, ambiguous boundaries, requirements that contradict YAGNI.
2. Document each gap with `{section, issue, severity, proposed fix}` so you can reference it when refining the plan.
3. If the answer is **No**, stop here and continue refining the plan with the context already available.
4. If the answer is **Yes**:
    - Build a clarification packet grouped by theme.
    - Prefill each question with the most plausible answer so the user can confirm/deny quickly.
    - Always include an **“Other / open-ended”** option to capture nuances you did not anticipate.
5. Send the packet, capture the responses (including open-ended notes), update the Plan Clarifications table, then jump back to Step 1 to ensure no new gaps remain.

```mermaid
flowchart TD
    A[Inspect current plan] --> B{Need more clarification?}
    B -- No --> C[End · proceed with refinement]
    B -- Yes --> D[Collect question set\n• targeted prompts\n• prefilled answers\n• open-ended field]
    D --> B
```

## Stage 3: Refinement Implementation

Once you have sufficient context (or have documented the missing context), refine the plan directly in-place:

1. **Maintain Identity**: Keep the existing `id` and directory. Do not create a new plan ID.
2. **Structure Compliance**: Ensure the plan still follows `.ai/task-manager/config/templates/PLAN_TEMPLATE.md`. Add missing sections if necessary.
3. **Content Updates**:
   - Refresh the executive summary to reflect clarifications and new insights.
   - Update architectural sections, diagrams, and risk mitigations to resolve the identified gaps.
   - Trim any scope creep that is not explicitly required.
   - Clearly reference clarifications in the relevant plan sections (e.g., italicized notes that point back to the Q&A table).
4. **Net-New Sections**: If the plan needs a new subsection (e.g., Decision Log, Data Contracts), add it under `Notes` with a clearly labeled section so it remains discoverable.
5. **Change Log**: Append a bullet list in the `Notes` section that briefly states what changed in this refinement session (e.g., `- 2025-03-16: Clarified auth flow tokens and updated architecture diagram`).
6. **Validation Hooks**: Execute `.ai/task-manager/config/hooks/POST_PLAN.md` to ensure the refined plan still meets quality bars.

## Output Requirements

1. Present a concise "Refinement Report" to the user containing:
   - Snapshot of the updated plan summary (title, summary line, plan path).
   - Key clarifications added (with links to sections if applicable).
   - Major improvements and remaining open questions (if any).
2. Ensure the plan file on disk is fully updated before finishing.

## Structured Output (MANDATORY)

Always end with the standardized summary so orchestrators can chain commands:

```
---

Plan Refinement Summary:
- Plan ID: [numeric-id]
- Plan File: [full-path-to-plan-file]
```
