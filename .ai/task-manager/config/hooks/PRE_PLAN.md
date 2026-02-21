# PRE_PLAN Hook

This hook provides pre-planning guidance to ensure scope control, simplicity principles, and proper validation requirements are established before comprehensive plan creation.


Run this script to detect the assistant:

```bash
assistant=$(node .ai/task-manager/config/scripts/detect-assistant.cjs)
```

<details>
<summary>
[IMPORTANT] Only for assistants that support assistant skills: Claude
</summary>

Analyze the current prompt in order to engage any relevant skills as necessary (either global or project skills).
</details>

## Scope Control Guidelines

**Critical: Implement ONLY what is explicitly requested**

- **Minimal Viable Implementation**: Build exactly what the user asked for, nothing more
- **Question Everything Extra**: If not directly mentioned by the user, don't add it
- **Avoid Feature Creep**: Resist the urge to add "helpful" features or "nice-to-have" additions
- **YAGNI Principle**: _You Aren't Gonna Need It_ - don't build for hypothetical future needs

**Common Scope Creep Anti-Patterns to Avoid:**
1. Adding extra commands or features "for completeness"
2. Creating infrastructure for future features that weren't requested
3. Building abstractions or frameworks when simple solutions suffice
4. Adding configuration options not specifically mentioned
5. Implementing error handling beyond what's necessary for the core request
6. Creating documentation or help systems unless explicitly requested

**When in doubt, ask**: "Is this feature explicitly mentioned in the user's request?"

## Simplicity Principles

**Favor maintainability over cleverness**

- **Simple Solutions First**: Choose the most straightforward approach that meets requirements
- **Avoid Over-Engineering**: Don't create complex systems when simple ones work
- **Readable Code**: Write code that others can easily understand and modify
- **Standard Patterns**: Use established patterns rather than inventing new ones
- **Minimal Dependencies**: Add external dependencies only when essential, but do not re-invent the wheel
- **Clear Structure**: Organize code in obvious, predictable ways

**Remember**: A working simple solution is better than a complex "perfect" one.

## Critical Notes

- Never generate a partial or assumed plan without adequate context
- Prioritize accuracy over speed
- Consider both technical and non-technical aspects
- Use the plan template in .ai/task-manager/config/templates/PLAN_TEMPLATE.md
- DO NOT create or list any tasks or phases during the plan creation. This will be done in a later step. Stick to writing the PRD (Project Requirements Document).