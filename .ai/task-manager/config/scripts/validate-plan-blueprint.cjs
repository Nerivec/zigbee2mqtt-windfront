#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Enable debug logging via environment variable
const DEBUG = process.env.DEBUG === 'true';

/**
 * Debug logging utility
 * @param {string} message - Debug message
 * @param {...any} args - Additional arguments to log
 */
function debugLog(message, ...args) {
  if (DEBUG) {
    console.error(`[DEBUG] ${message}`, ...args);
  }
}

/**
 * Error logging utility
 * @param {string} message - Error message
 * @param {...any} args - Additional arguments to log
 */
function errorLog(message, ...args) {
  console.error(`[ERROR] ${message}`, ...args);
}

/**
 * Find the task manager root directory by traversing up from current working directory
 * @returns {string|null} Path to task manager root or null if not found
 */
function findTaskManagerRoot() {
  let currentPath = process.cwd();
  const filesystemRoot = path.parse(currentPath).root;

  debugLog(`Starting search for task manager root from: ${currentPath}`);
  debugLog(`Filesystem root: ${filesystemRoot}`);

  while (currentPath !== filesystemRoot) {
    const taskManagerPlansPath = path.join(currentPath, '.ai', 'task-manager', 'plans');
    debugLog(`Checking for task manager at: ${taskManagerPlansPath}`);

    try {
      if (fs.existsSync(taskManagerPlansPath)) {
        const stats = fs.lstatSync(taskManagerPlansPath);
        if (stats.isDirectory()) {
          const taskManagerRoot = path.join(currentPath, '.ai', 'task-manager');
          debugLog(`Found valid task manager root at: ${taskManagerRoot}`);
          return taskManagerRoot;
        } else {
          debugLog(`Path exists but is not a directory: ${taskManagerPlansPath}`);
        }
      } else {
        debugLog(`Task manager path does not exist: ${taskManagerPlansPath}`);
      }
    } catch (err) {
      if (err.code === 'EPERM' || err.code === 'EACCES') {
        const warningMsg = `Warning: Permission denied accessing ${taskManagerPlansPath}`;
        console.warn(warningMsg);
        debugLog(`Permission error: ${err.message}`);
      } else {
        debugLog(`Filesystem error checking ${taskManagerPlansPath}: ${err.message}`);
      }
    }

    const parentPath = path.dirname(currentPath);

    if (parentPath === currentPath) {
      debugLog(`Reached filesystem root, stopping traversal`);
      break;
    }

    currentPath = parentPath;
    debugLog(`Moving up to parent directory: ${currentPath}`);
  }

  debugLog(`Task manager root not found in any parent directory`);
  return null;
}

/**
 * Find plan file and directory for a given plan ID
 * @param {string|number} planId - Plan ID to search for
 * @returns {Object|null} Object with planFile and planDir, or null if not found
 */
function findPlanById(planId) {
  const taskManagerRoot = findTaskManagerRoot();

  if (!taskManagerRoot) {
    errorLog('No .ai/task-manager directory found in current directory or any parent directory.');
    return null;
  }

  debugLog(`Task manager root found: ${taskManagerRoot}`);

  // Convert planId to numeric for flexible matching (handles both "2" and "02")
  const numericPlanId = parseInt(planId, 10);

  if (isNaN(numericPlanId)) {
    errorLog(`Invalid plan ID: ${planId}. Plan ID must be numeric.`);
    return null;
  }

  debugLog(`Searching for plan with numeric ID: ${numericPlanId} (input was: ${planId})`);

  const plansDir = path.join(taskManagerRoot, 'plans');
  const archiveDir = path.join(taskManagerRoot, 'archive');

  debugLog(`Searching for plan ID ${planId} in: ${plansDir}, ${archiveDir}`);

  // Search both plans and archive directories
  for (const dir of [plansDir, archiveDir]) {
    if (!fs.existsSync(dir)) {
      debugLog(`Directory does not exist: ${dir}`);
      continue;
    }

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      debugLog(`Found ${entries.length} entries in ${dir}`);

      for (const entry of entries) {
        // Match directory pattern: [plan-id]--* (with flexible ID matching)
        if (entry.isDirectory()) {
          // Extract numeric ID from directory name, stripping leading zeros
          const dirMatch = entry.name.match(/^0*(\d+)--/);
          if (dirMatch && parseInt(dirMatch[1], 10) === numericPlanId) {
            const planDirPath = path.join(dir, entry.name);
            debugLog(`Found matching plan directory: ${planDirPath} (extracted ID: ${dirMatch[1]} matches input: ${numericPlanId})`);

          try {
            const planDirEntries = fs.readdirSync(planDirPath, { withFileTypes: true });

            // Look for plan file: plan-[plan-id]--*.md (with flexible ID matching)
            for (const planEntry of planDirEntries) {
              if (planEntry.isFile()) {
                // Extract numeric ID from filename, stripping leading zeros
                const fileMatch = planEntry.name.match(/^plan-0*(\d+)--.*\.md$/);
                if (fileMatch && parseInt(fileMatch[1], 10) === numericPlanId) {
                  const planFilePath = path.join(planDirPath, planEntry.name);
                  debugLog(`Found plan file: ${planFilePath} (extracted ID: ${fileMatch[1]} matches input: ${numericPlanId})`);

                  return {
                    planFile: planFilePath,
                    planDir: planDirPath
                  };
                }
              }
            }

            debugLog(`No plan file found in directory: ${planDirPath}`);
          } catch (err) {
            errorLog(`Failed to read plan directory ${planDirPath}: ${err.message}`);
          }
          }
        }
      }
    } catch (err) {
      errorLog(`Failed to read directory ${dir}: ${err.message}`);
    }
  }

  debugLog(`Plan ID ${planId} not found in any directory`);
  return null;
}

/**
 * Count task files in a plan's tasks directory
 * @param {string} planDir - Plan directory path
 * @returns {number} Number of task files found
 */
function countTasks(planDir) {
  const tasksDir = path.join(planDir, 'tasks');

  if (!fs.existsSync(tasksDir)) {
    debugLog(`Tasks directory does not exist: ${tasksDir}`);
    return 0;
  }

  try {
    const stats = fs.lstatSync(tasksDir);
    if (!stats.isDirectory()) {
      debugLog(`Tasks path exists but is not a directory: ${tasksDir}`);
      return 0;
    }

    const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    debugLog(`Found ${files.length} task files in ${tasksDir}`);
    return files.length;
  } catch (err) {
    errorLog(`Failed to read tasks directory ${tasksDir}: ${err.message}`);
    return 0;
  }
}

/**
 * Check if execution blueprint section exists in plan file
 * @param {string} planFile - Path to plan file
 * @returns {boolean} True if blueprint section exists, false otherwise
 */
function checkBlueprintExists(planFile) {
  try {
    const planContent = fs.readFileSync(planFile, 'utf8');
    const blueprintExists = /^## Execution Blueprint/m.test(planContent);
    debugLog(`Blueprint section ${blueprintExists ? 'found' : 'not found'} in ${planFile}`);
    return blueprintExists;
  } catch (err) {
    errorLog(`Failed to read plan file ${planFile}: ${err.message}`);
    return false;
  }
}

/**
 * List available plans for error messaging
 * @returns {string[]} Array of plan directory names
 */
function listAvailablePlans() {
  const taskManagerRoot = findTaskManagerRoot();

  if (!taskManagerRoot) {
    return [];
  }

  const plansDir = path.join(taskManagerRoot, 'plans');
  const archiveDir = path.join(taskManagerRoot, 'archive');
  const plans = [];

  for (const dir of [plansDir, archiveDir]) {
    if (!fs.existsSync(dir)) {
      continue;
    }

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.match(/^\d+--/)) {
          plans.push(entry.name);
        }
      }
    } catch (err) {
      // Silently continue
    }
  }

  return plans.sort((a, b) => {
    const aId = parseInt(a.match(/^(\d+)--/)[1], 10);
    const bId = parseInt(b.match(/^(\d+)--/)[1], 10);
    return aId - bId;
  });
}

/**
 * Validate plan blueprint and output JSON or specific field
 * @param {string|number} planId - Plan ID to validate
 * @param {string} [fieldName] - Optional field name to extract (planFile, planDir, taskCount, blueprintExists)
 */
function validatePlanBlueprint(planId, fieldName) {
  if (!planId) {
    errorLog('Plan ID is required');
    errorLog('');
    errorLog('Usage: node validate-plan-blueprint.cjs <plan-id> [field-name]');
    errorLog('');
    errorLog('Examples:');
    errorLog('  node validate-plan-blueprint.cjs 47                  # Output full JSON');
    errorLog('  node validate-plan-blueprint.cjs 47 planFile         # Output just the plan file path');
    errorLog('  node validate-plan-blueprint.cjs 47 planDir          # Output just the plan directory');
    errorLog('  node validate-plan-blueprint.cjs 47 taskCount        # Output just the task count');
    errorLog('  node validate-plan-blueprint.cjs 47 blueprintExists  # Output yes/no');
    process.exit(1);
  }

  debugLog(`Validating plan blueprint for ID: ${planId}`);

  const planInfo = findPlanById(planId);

  if (!planInfo) {
    errorLog(`Plan ID ${planId} not found`);
    errorLog('');

    const availablePlans = listAvailablePlans();
    if (availablePlans.length > 0) {
      errorLog('Available plans:');
      availablePlans.forEach(plan => {
        errorLog(`  ${plan}`);
      });
    } else {
      errorLog('No plans found in .ai/task-manager/{plans,archive}/');
    }

    errorLog('');
    errorLog('Please verify:');
    errorLog('  1. You are in the correct project directory');
    errorLog('  2. The plan exists in .ai/task-manager/plans/ or .ai/task-manager/archive/');
    errorLog('  3. The plan directory follows the naming pattern: [plan-id]--[name]');
    errorLog('  4. The plan file follows the naming pattern: plan-[plan-id]--[name].md');
    process.exit(1);
  }

  const { planFile, planDir } = planInfo;
  const taskCount = countTasks(planDir);
  const blueprintExists = checkBlueprintExists(planFile);

  const result = {
    planFile,
    planDir,
    taskCount,
    blueprintExists: blueprintExists ? 'yes' : 'no'
  };

  debugLog('Validation complete:', result);

  // If field name is provided, output just that field
  if (fieldName) {
    const validFields = ['planFile', 'planDir', 'taskCount', 'blueprintExists'];
    if (!validFields.includes(fieldName)) {
      errorLog(`Invalid field name: ${fieldName}`);
      errorLog(`Valid fields: ${validFields.join(', ')}`);
      process.exit(1);
    }
    // Use process.stdout.write to avoid util.inspect colorization
    // Convert to string explicitly to ensure plain text output
    process.stdout.write(String(result[fieldName]) + '\n');
  } else {
    // Output full JSON for backward compatibility
    console.log(JSON.stringify(result, null, 2));
  }
}

// Main execution
const planId = process.argv[2];
const fieldName = process.argv[3];
validatePlanBlueprint(planId, fieldName);
