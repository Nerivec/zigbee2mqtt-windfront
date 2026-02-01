---
argument-hint: "[planId]"
description: Generate tasks to implement the plan with the provided ID.
---

# Comprehensive Task List Creation

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

You are a comprehensive task planning assistant. Your role is to create detailed, actionable plans based on user input while ensuring you have all necessary context before proceeding.

Include `.ai/task-manager/config/TASK_MANAGER.md` for the directory structure of tasks.

## Instructions

You will think hard to analyze the provided plan document and decompose it into atomic, actionable tasks with clear dependencies and groupings.

Use your internal Todo task tool to track the following process:

- [ ] Read and process plan $1
- [ ] Use the Task Generation Process to create tasks according to the Task Creation Guidelines
- [ ] Read and run the .ai/task-manager/config/hooks/POST_TASK_GENERATION_ALL.md

### Input

- A plan document. Extract it with the following command.

```bash
# Extract validation results directly from script
plan_file=$(node .ai/task-manager/config/scripts/validate-plan-blueprint.cjs $1 planFile)
```

### Input Error Handling
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
- **Skill-specific**: Executable by a single skill agent (examples below)
- **Verifiable**: Has clear completion criteria

#### Skill Selection and Technical Requirements

**Core Principle**: Each task should require 1-2 specific technical skills that can be handled by specialized agents. Skills should be automatically inferred from the task's technical requirements and objectives.

**Skill Selection Criteria**:
1. **Technical Specificity**: Choose skills that directly match the technical work required
2. **Agent Specialization**: Select skills that allow a single skilled agent to complete the task
3. **Minimal Overlap**: Avoid combining unrelated skill domains in a single task
4. **Creative Inference**: Derive skills from task objectives and implementation context

**Inspirational Skill Examples** (use kebab-case format):
- Frontend: `react-components`, `css`, `js`, `vue-components`, `html`
- Backend: `api-endpoints`, `database`, `authentication`, `server-config`
- Testing: `jest`, `playwright`, `unit-testing`, `e2e-testing`
- DevOps: `docker`, `github-actions`, `deployment`, `ci-cd`
- Languages: `typescript`, `python`, `php`, `bash`, `sql`
- Frameworks: `nextjs`, `express`, `drupal-backend`, `wordpress-plugins`

**Automatic Skill Inference Examples**:
- "Create user login form" → `["react-components", "authentication"]`
- "Build REST API for orders" → `["api-endpoints", "database"]`
- "Add Docker deployment" → `["docker", "deployment"]`
- "Write Jest tests for utils" → `["jest"]`

**Assignment Guidelines**:
- **1 skill**: Focused, single-domain tasks
- **2 skills**: Tasks requiring complementary domains
- **Split if 3+**: Indicates task should be broken down

```
# Examples
skills: ["css"]  # Pure styling
skills: ["api-endpoints", "database"]  # API with persistence
skills: ["react-components", "jest"]  # Implementation + testing
```

#### Meaningful Test Strategy Guidelines

**IMPORTANT** Make sure to copy this _Meaningful Test Strategy Guidelines_ section into all the tasks focused on testing, and **also** keep them in mind when generating tasks.

Your critical mantra for test generation is: "write a few tests, mostly integration".

**Definition of "Meaningful Tests":**
Tests that verify custom business logic, critical paths, and edge cases specific to the application. Focus on testing YOUR code, not the framework or library functionality.

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

**Test Task Creation Rules:**
- Combine related test scenarios into single tasks (e.g., "Test user authentication flow" not separate tasks for login, logout, validation)
- Focus on integration and critical path testing over unit test coverage
- Avoid creating separate tasks for testing each CRUD operation individually
- Question whether simple functions need dedicated test tasks

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

Dependency Rule: Task B depends on Task A if:
- B requires output or artifacts from A
- B modifies code created by A
- B tests functionality implemented in A

#### Step 3: Task Generation

##### Frontmatter Structure

Example:
```yaml
---
id: 1
group: "user-authentication"
dependencies: []  # List of task IDs, e.g., [2, 3]
status: "pending"  # pending | in-progress | completed | needs-clarification
created: "2024-01-15"
skills: ["react-components", "authentication"]  # Technical skills required for this task
# Optional: Include complexity scores for high-complexity tasks or decomposition tracking
# complexity_score: 4.2  # Composite complexity score (only if >4 or decomposed)
# complexity_notes: "Decomposed from original task due to high technical depth"
---
```

The schema for this frontmatter is:
```json
{
  "type": "object",
  "required": ["id", "group", "dependencies", "status", "created", "skills"],
  "properties": {
    "id": {
      "type": ["number"],
      "description": "Unique identifier for the task. An integer."
    },
    "group": {
      "type": "string",
      "description": "Group or category the task belongs to"
    },
    "dependencies": {
      "type": "array",
      "description": "List of task IDs this task depends on",
      "items": {
        "type": ["number"]
      }
    },
    "status": {
      "type": "string",
      "enum": ["pending", "in-progress", "completed", "needs-clarification"],
      "description": "Current status of the task"
    },
    "created": {
      "type": "string",
      "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
      "description": "Creation date in YYYY-MM-DD format"
    },
    "skills": {
      "type": "array",
      "description": "Technical skills required for this task (1-2 skills recommended)",
      "items": {
        "type": "string",
        "pattern": "^[a-z][a-z0-9-]*$"
      },
      "minItems": 1,
      "uniqueItems": true
    },
    "complexity_score": {
      "type": "number",
      "minimum": 1,
      "maximum": 10,
      "description": "Optional: Composite complexity score (include only if >4 or for decomposed tasks)"
    },
    "complexity_notes": {
      "type": "string",
      "description": "Optional: Rationale for complexity score or decomposition decisions"
    }
  },
  "additionalProperties": false
}
```

##### Task Body Structure

Use the task template in .ai/task-manager/config/templates/TASK_TEMPLATE.md

##### Task ID Generation

When creating tasks, you need to determine the next available task ID for the specified plan. Use this bash command to automatically generate the correct ID:

```bash
node .ai/task-manager/config/scripts/get-next-task-id.cjs $1
```

### Validation Checklist
Before finalizing, ensure:

**Core Task Requirements:**
- [ ] Each task has 1-2 appropriate technical skills assigned
- [ ] Skills are automatically inferred from task objectives and technical requirements
- [ ] All dependencies form an acyclic graph
- [ ] Task IDs are unique and sequential
- [ ] Groups are consistent and meaningful
- [ ] Every **explicitly stated** task from the plan is covered
- [ ] No redundant or overlapping tasks

**Complexity Analysis & Controls:**
- [ ] **Complexity Analysis Complete**: All tasks assessed using 5-dimension scoring
- [ ] **Decomposition Applied**: Tasks with composite score ≥6 have been decomposed or justified
- [ ] **Final Task Complexity**: All final tasks have composite score ≤5 (target ≤4)
- [ ] **Iteration Limits Respected**: No task exceeded 3 decomposition rounds
- [ ] **Minimum Viability**: No tasks decomposed below complexity threshold of 3
- [ ] **Quality Gates Passed**: All decomposed tasks meet enhanced quality criteria
- [ ] **Dependency Integrity**: No circular dependencies or orphaned tasks exist
- [ ] **Error Handling Complete**: All edge cases resolved or escalated appropriately

**Complexity Documentation Requirements:**
- [ ] **Complexity Scores Documented**: Individual dimension scores recorded for complex tasks
- [ ] **Decomposition History**: Iteration tracking included in `complexity_notes` for decomposed tasks
- [ ] **Validation Status**: All tasks marked with appropriate validation outcomes
- [ ] **Escalation Documentation**: High-complexity tasks have clear escalation notes
- [ ] **Consistency Validated**: Complexity scores align with task descriptions and skills

**Scope & Quality Control:**
- [ ] **Minimization Applied**: Each task is absolutely necessary (20-30% reduction target)
- [ ] **Test Tasks are Meaningful**: Focus on business logic, not framework functionality
- [ ] **No Gold-plating**: Only plan requirements are addressed
- [ ] **Total Task Count**: Represents minimum viable implementation
- [ ] **Scope Preservation**: Decomposed tasks collectively match original requirements

**System Reliability:**
- [ ] **Error Conditions Resolved**: No unresolved error states remain
- [ ] **Manual Intervention Flagged**: Complex edge cases properly escalated
- [ ] **Quality Checkpoints**: All validation gates completed successfully
- [ ] **Dependency Graph Validated**: Full dependency analysis confirms acyclic, logical relationships

### Error Handling
If the plan lacks sufficient detail:
- Note areas needing clarification
- Create placeholder tasks marked with `status: "needs-clarification"`
- Document assumptions made

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
