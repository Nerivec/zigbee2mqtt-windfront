# PRE_PHASE Hook

This hook contains the phase preparation logic that should be executed before starting any phase execution.

## Phase Pre-Execution

Before starting execution check if you are in the `main` branch. If so, create a git branch to work on this blueprint use the plan name for the branch name.

If there are unstaged changes in the `main` branch, do not create a feature branch.

## Phase Execution Workflow

1. **Phase Initialization**
    - Identify current phase from the execution blueprint
    - List all tasks scheduled for parallel execution in this phase
    - **Validate Task Dependencies**: For each task in the current phase, use the dependency checking script:
        ```bash
        # For each task in current phase
        for TASK_ID in $PHASE_TASKS; do
            if ! node .ai/task-manager/config/scripts/check-task-dependencies.cjs "$1" "$TASK_ID"; then
                echo "ERROR: Task $TASK_ID has unresolved dependencies - cannot proceed with phase execution"
                echo "Please resolve dependencies before continuing with blueprint execution"
                exit 1
            fi
        done
        ```
    - Confirm no tasks are marked "needs-clarification"
    - If any phases are marked as completed, verify they are actually completed and continue from the next phase.