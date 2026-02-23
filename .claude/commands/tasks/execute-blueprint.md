---
argument-hint: "[planId]"
description: Execute the task in the plan.
---
# Task Execution

## Assistant Configuration

Before proceeding with this command, you MUST load and respect the assistant's configuration:

**Run the following scripts:**
```bash
assistant=$(node .ai/task-manager/config/scripts/detect-assistant.cjs)
node .ai/task-manager/config/scripts/read-assistant-config.cjs "$assistant"
```

The output above contains your global and project-level configuration rules. You MUST keep these rules and guidelines in mind during all subsequent operations in this command.

---

You are the coordinator responsible for executing all tasks defined in the execution blueprint of a plan document, so choose an appropriate sub-agent for this role. Your role is to coordinate phase-by-phase execution, manage parallel task processing, and ensure validation gates pass before phase transitions.

## Critical Rules

1. **Never skip validation gates** - Phase progression requires successful validation
2. **Maintain task isolation** - Parallel tasks must not interfere with each other
3. **Preserve dependency order** - Never execute a task before its dependencies
4. **Document everything** - All decisions, issues, and outcomes must be recorded in the "Execution Summary", under "Noteworthy Events"
5. **Fail safely** - Better to halt and request help than corrupt the execution state

## Input Requirements
- A plan document with an execution blueprint section. See /TASK_MANAGER.md fo find the plan with ID $1
- Task files with frontmatter metadata (id, group, dependencies, status)
- Validation gates document: `/config/hooks/POST_PHASE.md`

### Input Error Handling

If the plan does not exist, stop immediately and show an error to the user.

**Note**: If tasks or the execution blueprint section are missing, they will be automatically generated before execution begins (see Task and Blueprint Validation below).

### Task and Blueprint Validation

Before proceeding with execution, validate that tasks exist and the execution blueprint has been generated. If either is missing, automatically invoke task generation.

**Validation Steps:**

```bash
# Extract validation results directly from script
plan_file=$(node .ai/task-manager/config/scripts/validate-plan-blueprint.cjs $1 planFile)
plan_dir=$(node .ai/task-manager/config/scripts/validate-plan-blueprint.cjs $1 planDir)
task_count=$(node .ai/task-manager/config/scripts/validate-plan-blueprint.cjs $1 taskCount)
blueprint_exists=$(node .ai/task-manager/config/scripts/validate-plan-blueprint.cjs $1 blueprintExists)
```

4. **Automatic task generation**:

If either `$task_count` is 0 or `$blueprint_exists` is "no":
   - Display notification to user: "⚠️ Tasks or execution blueprint not found. Generating tasks automatically..."
   - Execute the embedded task generation process below

   ## Embedded Task Generation

   Follow ALL instructions from `generate-tasks.md` exactly for plan ID $1.

   This includes:
   - Reading and processing the plan document
   - Applying task minimization principles (20-30% reduction target)
   - Creating atomic tasks with 1-2 skills each
   - Generating proper task files with frontmatter and body structure
   - Running all validation checklists
   - Executing the POST_TASK_GENERATION_ALL hook

   ## Resume Blueprint Execution

   After task generation completes, continue with execution below.

Otherwise, if tasks exist, proceed directly to execution.

## Execution Process

Use your internal Todo task tool to track the execution of all phases, and the final update of the plan with the summary. Example:

- [ ] Create feature branch from the main branch.
- [ ] Validate or auto-generate tasks and execution blueprint if missing.
- [ ] Execute .ai/task-manager/config/hooks/PRE_PHASE.md hook before Phase 1.
- [ ] Phase 1: Execute 1 task(s) in parallel.
- [ ] Execute .ai/task-manager/config/hooks/POST_PHASE.md hook after Phase 1.
- [ ] Execute .ai/task-manager/config/hooks/PRE_PHASE.md hook before Phase 2.
- [ ] Phase 2: Execute 3 task(s) in parallel.
- [ ] Execute .ai/task-manager/config/hooks/POST_PHASE.md hook after Phase 2.
- [ ] Execute .ai/task-manager/config/hooks/PRE_PHASE.md hook before Phase 3.
- [ ] Phase 3: Execute 1 task(s) in parallel.
- [ ] Execute .ai/task-manager/config/hooks/POST_PHASE.md hook after Phase 3.
- [ ] Update the Plan 7 with execution summary using .ai/task-manager/config/hooks/EXECUTION_SUMMARY_TEMPLATE.md.
- [ ] Archive Plan 7.

### Phase Pre-Execution

Read and execute .ai/task-manager/config/hooks/PRE_PHASE.md

### Phase Execution Workflow

1. **Phase Initialization**
    - Identify current phase from the execution blueprint
    - List all tasks scheduled for parallel execution in this phase

2. **Agent Selection and Task Assignment**
Read and execute .ai/task-manager/config/hooks/PRE_TASK_ASSIGNMENT.md

3. **Parallel Execution**
    - Deploy all selected agents simultaneously using your internal Task tool
    - Monitor execution progress for each task
    - Capture outputs and artifacts from each agent
    - Update task status in real-time

4. **Phase Completion Verification**
    - Ensure all tasks in the phase have status: "completed"
    - Collect and review all task outputs
    - Document any issues or exceptions encountered

### Phase Post-Execution

Read and execute .ai/task-manager/config/hooks/POST_PHASE.md


### Phase Transition

  - Update phase status to "completed" in the Blueprint section of the plan $1 document.
  - Initialize next phase
  - Repeat process until all phases are complete

### Error Handling

#### Validation Gate Failures
Read and execute .ai/task-manager/config/hooks/POST_ERROR_DETECTION.md

### Output Requirements

**Output Behavior:**

Provide a concise execution summary:
- Example: "Execution completed. Review summary: `.ai/task-manager/archive/[plan]/plan-[id].md`"

**CRITICAL - Structured Output for Command Coordination:**

Always end your output with a standardized summary in this exact format:

```
---
Execution Summary:
- Plan ID: [numeric-id]
- Status: Archived
- Location: .ai/task-manager/archive/[plan-id]--[plan-name]/
```

This structured output enables automated workflow coordination and must be included even when running standalone.

## Optimization Guidelines

- **Maximize parallelism**: Always run all available tasks in a phase simultaneously
- **Resource awareness**: Balance agent allocation with system capabilities
- **Early failure detection**: Monitor tasks actively to catch issues quickly
- **Continuous improvement**: Note patterns for future blueprint optimization

## Post-Execution Processing

Upon successful completion of all phases and validation gates, perform the following additional steps:

- [ ] Execution Summary Generation
- [ ] Plan Archival

### 1. Execution Summary Generation

Append an execution summary section to the plan document with the format described in .ai/task-manager/config/templates/[EXECUTION_SUMMARY_TEMPLATE.md

### 2. Plan Archival

After successfully appending the execution summary:

**Move completed plan to archive**:
```bash
mv .ai/task-manager/plans/[plan-folder] .ai/task-manager/archive/
```

### Important Notes

- **Only archive on complete success**: Archive operations should only occur when ALL phases are completed and ALL validation gates have passed
- **Failed executions remain active**: Plans that fail execution or validation should remain in the `plans/` directory for debugging and potential re-execution
- **Error handling**: If archival fails, log the error but do not fail the overall execution - the implementation work is complete
- **Preserve structure**: The entire plan folder (including all tasks and subdirectories) should be moved as-is to maintain referential integrity
