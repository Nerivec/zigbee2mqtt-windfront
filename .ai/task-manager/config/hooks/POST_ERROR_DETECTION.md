# POST_ERROR_DETECTION Hook

This hook provides error handling procedures for task execution failures and validation gate failures.

## Task Execution Error Handling

If task execution fails:

```bash
# On execution failure, update status to failed
echo "Task execution failed - updating status..."

TEMP_FILE=$(mktemp)
awk '
    /^---$/ {
        if (++delim == 1) {
            print
            next
        } else if (delim == 2) {
            print "status: \"failed\""
            print
            next
        }
    }
    /^status:/ && delim == 1 {
        print "status: \"failed\""
        next
    }
    { print }
' "$TASK_FILE" > "$TEMP_FILE"

mv "$TEMP_FILE" "$TASK_FILE"

echo "Task ${TASK_ID} marked as failed"
echo "Check the task requirements and try again"
exit 1
```

## Validation Gate Failure Handling

#### Validation Gate Failures
If validation gates fail:
1. Document which specific validations failed
2. Identify which tasks may have caused the failure
3. Generate remediation plan
4. Re-execute affected tasks after fixes
5. Re-run validation gates
6. If errors persist, escalate to the user