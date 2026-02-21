# PRE_TASK_ASSIGNMENT Hook

This hook executes before task assignment to determine the most appropriate agent for each task based on skill requirements and available sub-agents.

## Agent Selection and Task Assignment

- For each task in the current phase:
    - Read task frontmatter to extract the `skills` property (array of technical skills)
    - Analyze task requirements and technical domain from description
    - Match task skills against available sub-agent capabilities
    - Select the most appropriate sub-agent (if any are available). If no sub-agent is appropriate, use the general-purpose one.
    - Consider task-specific requirements from the task document

Run this script to detect the assistant:

```bash
assistant=$(node .ai/task-manager/config/scripts/detect-assistant.cjs)
```

<details>
<summary>
[IMPORTANT] Only for assistants that support assistant skills: Claude
</summary>

Analyze the set of tasks skills in order to engage any relevant assistant skills as necessary (either global or project skills).
</details>


## Available Sub-Agents
Analyze the sub-agents available in your current assistant's agents directory. If none are available
or the available ones do not match the task's requirements, then use a generic
agent.

## Matching Criteria
Select agents based on:
1. **Primary skill match**: Task technical requirements from the `skills` array in task frontmatter
2. **Domain expertise**: Specific frameworks or libraries mentioned in task descriptions
3. **Task complexity**: Senior vs. junior agent capabilities
4. **Resource efficiency**: Avoid over-provisioning for simple tasks

## Skills Extraction and Agent Detection

Read task skills and select appropriate task-specific agent:

```bash
# Extract skills from task frontmatter
TASK_SKILLS=$(awk '
    /^---$/ { if (++delim == 2) exit }
    /^skills:/ {
        in_skills = 1
        # Check if skills are on the same line
        if (match($0, /\[.*\]/)) {
            gsub(/^skills:[ \t]*\[/, "")
            gsub(/\].*$/, "")
            gsub(/[ \t]/, "")
            print
            in_skills = 0
        }
        next
    }
    in_skills && /^[^ ]/ { in_skills = 0 }
    in_skills && /^[ \t]*-/ {
        gsub(/^[ \t]*-[ \t]*/, "")
        gsub(/^"/, ""); gsub(/"$/, "")
        print
    }
' "$TASK_FILE" | tr ',' '\n' | sed 's/^[ \t]*//;s/[ \t]*$//' | grep -v '^$')

echo "Task skills required: $TASK_SKILLS"

# Check for available sub-agents across assistant directories
AGENT_FOUND=false
for assistant_dir in .claude .gemini .opencode; do
    if [ -d "$assistant_dir/agents" ] && [ -n "$(ls $assistant_dir/agents 2>/dev/null)" ]; then
        echo "Available sub-agents detected in $assistant_dir - will match to task requirements"
        AGENT_FOUND=true
        break
    fi
done

if [ "$AGENT_FOUND" = false ]; then
    echo "Using general-purpose agent for task execution"
fi
```