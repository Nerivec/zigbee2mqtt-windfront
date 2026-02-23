---
argument-hint: "[userPrompt]"
description: Execute the full workflow from plan creation to blueprint execution.
---
# Full Workflow Execution

You are a workflow composition assistant. Your role is to execute the complete task management workflow from plan creation through blueprint execution **without pausing between steps**. This is a fully automated workflow that executes all three steps sequentially.

## Assistant Configuration

Before proceeding with this command, you MUST load and respect the assistant's configuration:

**Run the following scripts:**
```bash
assistant=$(node .ai/task-manager/config/scripts/detect-assistant.cjs)
node .ai/task-manager/config/scripts/read-assistant-config.cjs "$assistant"
```

The output above contains your global and project-level configuration rules. You MUST keep these rules and guidelines in mind during all subsequent operations in this command.

---

## Workflow Execution Instructions

**CRITICAL**: Execute all three steps sequentially without waiting for user input between steps. Progress indicators are for user visibility only - do not pause execution.

The user input is:

<user-input>
$ARGUMENTS
</user-input>

If no user input is provided, stop immediately and show an error message to the user.

### Context Passing Between Steps

**How information flows through the workflow:**
1. User provides prompt → use as input in Step 1
2. Step 1 outputs "Plan ID: X" in structured format → extract X, use in Step 2
3. Step 2 outputs "Tasks: Y" in structured format → use for progress tracking in Step 3

Use your internal Todo task tool to track the workflow execution:

- [ ] Step 1: Create Plan
- [ ] Step 2: Generate Tasks
- [ ] Step 3: Execute Blueprint

---

## Step 1: Plan Creation

**Progress**: ⬛⬜⬜ 0% - Step 1/3: Starting Plan Creation

Execute the following plan creation process:

Think harder and use tools.

You are a comprehensive task planning assistant. Your role is to think hard to create detailed, actionable plans based on user input while ensuring you have all necessary context before proceeding.

Include .ai/task-manager/config/TASK_MANAGER.md for the directory structure of tasks.

### Process

Use your internal Todo task tool to track the plan generation:

- [ ] Read and execute .ai/task-manager/config/hooks/PRE_PLAN.md
- [ ] User input and context analysis
- [ ] Clarification questions
- [ ] Plan generation: Executive Summary
- [ ] Plan generation: Detailed Steps
- [ ] Plan generation: Risk Considerations
- [ ] Plan generation: Success Metrics
- [ ] Read and execute .ai/task-manager/config/hooks/POST_PLAN.md

#### Context Analysis
Before creating any plan, analyze the user's request for:
- **Objective**: What is the end goal?
- **Scope**: What are the boundaries and constraints?
- **Resources**: What tools, budget, or team are available?
- **Success Criteria**: How will success be measured?
- **Dependencies**: What prerequisites or blockers exist?
- **Technical Requirements**: What technologies or skills are needed?

#### Clarification Phase
If any critical context is missing:
1. Identify specific gaps in the information provided
2. Ask targeted follow-up questions grouped by category
3. Wait for user responses before proceeding to planning
4. Frame questions clearly with examples when helpful
5. Be extra cautious. Users miss important context very often. Don't hesitate to ask for clarifications.

Example clarifying questions:
- "Q: What is your primary goal with [specific aspect]?"
- "Q: Do you have any existing [resources/code/infrastructure] I should consider?"
- "Q: What is your timeline for completing this?"
- "Q: Are there specific constraints I should account for?"
- "Q: Do you want me to write tests for this?"
- "Q: Are there other systems, projects, or modules that perform a similar task?"

Try to answer your own questions first by inspecting the codebase, docs, and assistant documents like CLAUDE.md, GEMINI.md, AGENTS.md ...

#### Plan Generation
Only after confirming sufficient context, create a plan that includes:
1. **Executive Summary**: Brief overview of the approach
2. **Detailed Steps**: Numbered, actionable tasks with clear outcomes
3. **Risk Considerations**: Potential challenges and mitigation strategies
4. **Success Metrics**: How to measure completion and quality

Remember that a plan needs to be reviewed by a human. Be concise and to the point. Also, include mermaid diagrams to illustrate the plan.

#### Output Format

**Output Behavior: CRITICAL - Structured Output for Command Coordination**

Always end your output with a standardized summary in this exact format, for command coordination:

```
---

Plan Summary:
- Plan ID: [numeric-id]
- Plan File: [full-path-to-plan-file]
```

This structured output enables automated workflow coordination and must be included even when running standalone.

#### Plan Template

Use the template in .ai/task-manager/config/templates/PLAN_TEMPLATE.md

#### Patterns to Avoid
Do not include the following in your plan output.
- Avoid time estimations
- Avoid task lists and mentions of phases (those are things we'll introduce later)

#### Frontmatter Structure

Example:
```yaml
---
id: 1
summary: "Implement a comprehensive CI/CD pipeline using GitHub Actions for automated linting, testing, semantic versioning, and NPM publishing"
created: 2025-09-01
---
```

#### Plan ID Generation

**Auto-generate the next plan ID:**
```bash
node .ai/task-manager/config/scripts/get-next-plan-id.cjs
```

**Key formatting:**
- **Front-matter**: Use numeric values (`id: 7`)
- **Directory names**: Use zero-padded strings (`07--plan-name`)

**After completing Step 1:**
- Extract the Plan ID from the structured output
- Extract the Plan File path from the structured output

**Progress**: ⬛⬜⬜ 33% - Step 1/3: Plan Creation Complete

---

## Step 2: Task Generation

**Progress**: ⬛⬜⬜ 33% - Step 2/3: Starting Task Generation

Using the Plan ID extracted from Step 1, execute task generation:

Think harder and use tools.

You are a comprehensive task planning assistant. Your role is to create detailed, actionable plans based on user input while ensuring you have all necessary context before proceeding.

Include /TASK_MANAGER.md for the directory structure of tasks.

### Instructions

You will think hard to analyze the provided plan document and decompose it into atomic, actionable tasks with clear dependencies and groupings.

Use your internal Todo task tool to track the following process:

- [ ] Read and process plan [PLAN_ID from Step 1]
- [ ] Use the Task Generation Process to create tasks according to the Task Creation Guidelines
- [ ] Read and run the .ai/task-manager/config/hooks/POST_TASK_GENERATION_ALL.md

#### Input
- A plan document. See .ai/task-manager/config/TASK_MANAGER.md to find the plan with ID from Step 1
- The plan contains high-level objectives and implementation steps

#### Input Error Handling
If the plan does not exist. Stop immediately and show an error to the user.

### Task Creation Guidelines

#### Task Minimization Principles
**Core Constraint:** Create only the minimum number of tasks necessary to satisfy the plan requirements. Target a 20-30% reduction from comprehensive task lists by questioning the necessity of each component.

**Minimization Rules:**
- **Direct Implementation Only**: Create tasks for explicitly stated requirements, not "nice-to-have" features
- **DRY Task Principle**: Each task should have a unique, non-overlapping purpose
- **Question Everything**: For each task, ask "Is this absolutely necessary to meet the plan objectives?"
- **Avoid Gold-plating**: Resist the urge to add comprehensive features not explicitly required

**Antipatterns to Avoid:**
- Creating separate tasks for "error handling" when it can be included in the main implementation
- Breaking simple operations into multiple tasks (e.g., separate "validate input" and "process input" tasks)
- Adding tasks for "future extensibility" or "best practices" not mentioned in the plan
- Creating comprehensive test suites for trivial functionality

#### Task Granularity
Each task must be:
- **Single-purpose**: One clear deliverable or outcome
- **Atomic**: Cannot be meaningfully split further
- **Skill-specific**: Executable by a single skill agent
- **Verifiable**: Has clear completion criteria

#### Skill Selection and Technical Requirements

**Core Principle**: Each task should require 1-2 specific technical skills that can be handled by specialized agents. Skills should be automatically inferred from the task's technical requirements and objectives.

**Assignment Guidelines**:
- **1 skill**: Focused, single-domain tasks
- **2 skills**: Tasks requiring complementary domains
- **Split if 3+**: Indicates task should be broken down

#### Meaningful Test Strategy Guidelines

**IMPORTANT** Make sure to copy this _Meaningful Test Strategy Guidelines_ section into all the tasks focused on testing, and **also** keep them in mind when generating tasks.

Your critical mantra for test generation is: "write a few tests, mostly integration".

**When TO Write Tests:**
- Custom business logic and algorithms
- Critical user workflows and data transformations
- Edge cases and error conditions for core functionality
- Integration points between different system components
- Complex validation logic or calculations

**When NOT to Write Tests:**
- Third-party library functionality (already tested upstream)
- Framework features (React hooks, Express middleware, etc.)
- Simple CRUD operations without custom logic
- Getter/setter methods or basic property access
- Configuration files or static data
- Obvious functionality that would break immediately if incorrect

### Task Generation Process

#### Step 1: Task Decomposition
1. Read through the entire plan
2. Identify all concrete deliverables **explicitly stated** in the plan
3. Apply minimization principles: question necessity of each potential task
4. Break each deliverable into atomic tasks (only if genuinely needed)
5. Ensure no task requires multiple skill sets
6. Verify each task has clear inputs and outputs
7. **Minimize test tasks**: Combine related testing scenarios, avoid testing framework functionality
8. Be very detailed with the "Implementation Notes". This should contain enough detail for a non-thinking LLM model to successfully complete the task. Put these instructions in a collapsible field `<details>`.

#### Step 2: Dependency Analysis
For each task, identify:
- **Hard dependencies**: Tasks that MUST complete before this can start
- **Soft dependencies**: Tasks that SHOULD complete for optimal execution
- **No circular dependencies**: Validate the dependency graph is acyclic

#### Step 3: Task Generation

Use the task template in .ai/task-manager/config/templates/TASK_TEMPLATE.md

**Task ID Generation:**

When creating tasks, you need to determine the next available task ID for the specified plan. Use this bash command to automatically generate the correct ID:

```bash
node .ai/task-manager/config/scripts/get-next-task-id.cjs [PLAN_ID from Step 1]
```

#### Step 4: POST_TASK_GENERATION_ALL hook

Read and run the .ai/task-manager/config/hooks/POST_TASK_GENERATION_ALL.md

### Output Requirements

**Output Behavior:**

Provide a concise completion message with task count and location:
- Example: "Task generation complete. Created [count] tasks in `.ai/task-manager/plans/[plan-id]--[name]/tasks/`"

**CRITICAL - Structured Output for Command Coordination:**

Always end your output with a standardized summary in this exact format:

```
---
Task Generation Summary:
- Plan ID: [numeric-id]
- Tasks: [count]
- Status: Ready for execution
```

This structured output enables automated workflow coordination and must be included even when running standalone.

**Progress**: ⬛⬛⬜ 66% - Step 2/3: Task Generation Complete

---

## Step 3: Blueprint Execution

**Progress**: ⬛⬛⬜ 66% - Step 3/3: Starting Blueprint Execution

Using the Plan ID from previous steps, execute the blueprint:

You are the coordinator responsible for executing all tasks defined in the execution blueprint of a plan document, so choose an appropriate sub-agent for this role. Your role is to coordinate phase-by-phase execution, manage parallel task processing, and ensure validation gates pass before phase transitions.

### Critical Rules

1. **Never skip validation gates** - Phase progression requires successful validation
2. **Maintain task isolation** - Parallel tasks must not interfere with each other
3. **Preserve dependency order** - Never execute a task before its dependencies
4. **Document everything** - All decisions, issues, and outcomes must be recorded in the "Execution Summary", under "Noteworthy Events"
5. **Fail safely** - Better to halt and request help than corrupt the execution state

### Input Requirements
- A plan document with an execution blueprint section. See /TASK_MANAGER.md to find the plan with ID from Step 1
- Task files with frontmatter metadata (id, group, dependencies, status)
- Validation gates document: `/config/hooks/POST_PHASE.md`

#### Input Error Handling

If the plan does not exist, stop immediately and show an error to the user.

**Note**: If tasks or the execution blueprint section are missing, they will be automatically generated before execution begins (see Task and Blueprint Validation below).

#### Task and Blueprint Validation

Before proceeding with execution, validate that tasks exist and the execution blueprint has been generated. If either is missing, automatically invoke task generation.

**Validation Steps:**

```bash
# Extract validation results directly from script
plan_file=$(node .ai/task-manager/config/scripts/validate-plan-blueprint.cjs [planId] planFile)
plan_dir=$(node .ai/task-manager/config/scripts/validate-plan-blueprint.cjs [planId] planDir)
task_count=$(node .ai/task-manager/config/scripts/validate-plan-blueprint.cjs [planId] taskCount)
blueprint_exists=$(node .ai/task-manager/config/scripts/validate-plan-blueprint.cjs [planId] blueprintExists)
```

If either `$task_count` is 0 or `$blueprint_exists` is "no":
   - Display notification to user: "⚠️ Tasks or execution blueprint not found. Generating tasks automatically..."

### Execution Process

Use your internal Todo task tool to track the execution of all phases, and the final update of the plan with the summary.

#### Phase Pre-Execution

Read and execute .ai/task-manager/config/hooks/PRE_PHASE.md

#### Phase Execution Workflow

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

#### Phase Post-Execution

Read and execute .ai/task-manager/config/hooks/POST_PHASE.md

#### Phase Transition

  - Update phase status to "completed" in the Blueprint section of the plan document.
  - Initialize next phase
  - Repeat process until all phases are complete

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

### Post-Execution Processing

Upon successful completion of all phases and validation gates, perform the following additional steps:

- [ ] Execution Summary Generation
- [ ] Plan Archival

#### Execution Summary Generation

Append an execution summary section to the plan document with the format described in .ai/task-manager/config/templates/EXECUTION_SUMMARY_TEMPLATE.md

#### Plan Archival

After successfully appending the execution summary:

**Move completed plan to archive**:
```bash
mv .ai/task-manager/plans/[plan-folder] .ai/task-manager/archive/
```

**Progress**: ⬛⬛⬛ 100% - Step 3/3: Blueprint Execution Complete

---

## Final Summary

Generate an extremely concise final summary using the structured output from Step 3.
