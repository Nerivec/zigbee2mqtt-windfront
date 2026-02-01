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
  // Start from the actual current working directory, not process.cwd()
  // This ensures we start from the correct context where the script is being executed
  let currentPath = process.cwd();
  const filesystemRoot = path.parse(currentPath).root;

  debugLog(`Starting search for task manager root from: ${currentPath}`);
  debugLog(`Filesystem root: ${filesystemRoot}`);

  // Traverse upward through parent directories until we reach the filesystem root
  while (currentPath !== filesystemRoot) {
    const taskManagerPlansPath = path.join(currentPath, '.ai', 'task-manager', 'plans');
    debugLog(`Checking for task manager at: ${taskManagerPlansPath}`);

    try {
      // Check if this is a valid task manager directory
      if (fs.existsSync(taskManagerPlansPath)) {
        // Verify it's a directory, not a file
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
      // Handle permission errors or other filesystem issues gracefully
      // Continue searching in parent directories
      if (err.code === 'EPERM' || err.code === 'EACCES') {
        const warningMsg = `Warning: Permission denied accessing ${taskManagerPlansPath}`;
        console.warn(warningMsg);
        debugLog(`Permission error: ${err.message}`);
      } else {
        debugLog(`Filesystem error checking ${taskManagerPlansPath}: ${err.message}`);
      }
    }

    // Move up to parent directory
    const parentPath = path.dirname(currentPath);

    // Safety check: if path.dirname returns the same path, we've reached the root
    if (parentPath === currentPath) {
      debugLog(`Reached filesystem root, stopping traversal`);
      break;
    }

    currentPath = parentPath;
    debugLog(`Moving up to parent directory: ${currentPath}`);
  }

  // Check the filesystem root as the final attempt
  try {
    const rootTaskManagerPlans = path.join(filesystemRoot, '.ai', 'task-manager', 'plans');
    debugLog(`Final check at filesystem root: ${rootTaskManagerPlans}`);

    if (fs.existsSync(rootTaskManagerPlans)) {
      const stats = fs.lstatSync(rootTaskManagerPlans);
      if (stats.isDirectory()) {
        const taskManagerRoot = path.join(filesystemRoot, '.ai', 'task-manager');
        debugLog(`Found task manager root at filesystem root: ${taskManagerRoot}`);
        return taskManagerRoot;
      }
    }
  } catch (err) {
    debugLog(`Error checking filesystem root: ${err.message}`);
  }

  debugLog(`Task manager root not found in any parent directory`);
  return null;
}

/**
 * Parse YAML frontmatter for ID with comprehensive error handling and debug logging
 * @param {string} content - File content
 * @param {string} [filePath] - Optional file path for error context
 * @returns {number|null} Extracted ID or null
 */
function extractIdFromFrontmatter(content, filePath = 'unknown') {
  debugLog(`Attempting to extract ID from frontmatter in: ${filePath}`);

  // Check for frontmatter block existence
  const frontmatterMatch = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) {
    debugLog(`No frontmatter block found in: ${filePath}`);
    return null;
  }

  const frontmatterText = frontmatterMatch[1];
  debugLog(`Found frontmatter block in ${filePath}:\n${frontmatterText}`);

  // Enhanced patterns to handle various YAML formats and edge cases:
  // - id: 5                    (simple numeric)
  // - id: "5"                  (double quoted)
  // - id: '5'                  (single quoted)
  // - "id": 5                  (quoted key)
  // - 'id': 5                  (single quoted key)
  // - id : 5                   (extra spaces)
  // - id: 05                   (zero-padded)
  // - id: +5                   (explicit positive)
  // - Mixed quotes: 'id': "5"  (different quote types)
  const patterns = [
    // Most flexible pattern - handles quoted/unquoted keys and values with optional spaces
    {
      regex: /^\s*["']?id["']?\s*:\s*["']?([+-]?\d+)["']?\s*(?:#.*)?$/mi,
      description: 'Flexible pattern with optional quotes and comments'
    },
    // Simple numeric with optional whitespace and comments
    {
      regex: /^\s*id\s*:\s*([+-]?\d+)\s*(?:#.*)?$/mi,
      description: 'Simple numeric with optional comments'
    },
    // Double quoted values
    {
      regex: /^\s*["']?id["']?\s*:\s*"([+-]?\d+)"\s*(?:#.*)?$/mi,
      description: 'Double quoted values'
    },
    // Single quoted values
    {
      regex: /^\s*["']?id["']?\s*:\s*'([+-]?\d+)'\s*(?:#.*)?$/mi,
      description: 'Single quoted values'
    },
    // Mixed quotes - quoted key, unquoted value
    {
      regex: /^\s*["']id["']\s*:\s*([+-]?\d+)\s*(?:#.*)?$/mi,
      description: 'Quoted key, unquoted value'
    },
    // YAML-style with pipe or greater-than indicators (edge case)
    {
      regex: /^\s*id\s*:\s*[|>]\s*([+-]?\d+)\s*$/mi,
      description: 'YAML block scalar indicators'
    }
  ];

  // Try each pattern in order
  for (let i = 0; i < patterns.length; i++) {
    const { regex, description } = patterns[i];
    debugLog(`Trying pattern ${i + 1} (${description}) on ${filePath}`);

    const match = frontmatterText.match(regex);
    if (match) {
      debugLog(`Pattern ${i + 1} matched in ${filePath}: "${match[0].trim()}"`);

      const rawId = match[1];
      const id = parseInt(rawId, 10);

      // Validate the parsed ID
      if (isNaN(id)) {
        errorLog(`Invalid ID value "${rawId}" in ${filePath} - not a valid number`);
        continue;
      }

      if (id < 0) {
        errorLog(`Invalid ID value ${id} in ${filePath} - ID must be non-negative`);
        continue;
      }

      if (id > Number.MAX_SAFE_INTEGER) {
        errorLog(`Invalid ID value ${id} in ${filePath} - ID exceeds maximum safe integer`);
        continue;
      }

      debugLog(`Successfully extracted ID ${id} from ${filePath}`);
      return id;
    } else {
      debugLog(`Pattern ${i + 1} did not match in ${filePath}`);
    }
  }

  // If no patterns matched, try to identify common issues
  debugLog(`All patterns failed for ${filePath}. Analyzing frontmatter for common issues...`);

  // Check for 'id' field existence (case-insensitive)
  const hasIdField = /^\s*["']?id["']?\s*:/mi.test(frontmatterText);
  if (!hasIdField) {
    debugLog(`No 'id' field found in frontmatter of ${filePath}`);
  } else {
    // ID field exists but didn't match - might be malformed
    const idLineMatch = frontmatterText.match(/^\s*["']?id["']?\s*:.*$/mi);
    if (idLineMatch) {
      const idLine = idLineMatch[0].trim();
      errorLog(`Found malformed ID line in ${filePath}: "${idLine}"`);

      // Check for common formatting issues
      if (idLine.includes('null') || idLine.includes('undefined')) {
        errorLog(`ID field has null/undefined value in ${filePath}`);
      } else if (idLine.match(/:\s*$/)) {
        errorLog(`ID field has missing value in ${filePath}`);
      } else if (idLine.includes('[') || idLine.includes('{')) {
        errorLog(`ID field appears to be array/object instead of number in ${filePath}`);
      } else {
        errorLog(`ID field has unrecognized format in ${filePath}`);
      }
    }
  }

  errorLog(`Failed to extract ID from frontmatter in ${filePath}`);
  return null;
}

/**
 * Get the next available plan ID by scanning existing plan files
 * @returns {number} Next available plan ID
 */
function getNextPlanId() {
  const taskManagerRoot = findTaskManagerRoot();

  if (!taskManagerRoot) {
    errorLog('No .ai/task-manager/plans directory found in current directory or any parent directory.');
    errorLog('');
    errorLog('Please ensure you are in a project with task manager initialized, or navigate to the correct');
    errorLog('project directory. The task manager looks for the .ai/task-manager/plans structure starting');
    errorLog('from the current working directory and traversing upward through parent directories.');
    errorLog('');
    errorLog(`Current working directory: ${process.cwd()}`);
    process.exit(1);
  }

  debugLog(`Task manager root found: ${taskManagerRoot}`);

  const plansDir = path.join(taskManagerRoot, 'plans');
  const archiveDir = path.join(taskManagerRoot, 'archive');

  debugLog(`Scanning directories: ${plansDir}, ${archiveDir}`);

  let maxId = 0;
  let filesScanned = 0;
  let errorsEncountered = 0;

  // Scan both plans and archive directories
  [plansDir, archiveDir].forEach(dir => {
    const dirName = path.basename(dir);
    debugLog(`Scanning directory: ${dir}`);

    if (!fs.existsSync(dir)) {
      debugLog(`Directory does not exist: ${dir}`);
      return;
    }

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      debugLog(`Found ${entries.length} entries in ${dir}`);

      entries.forEach(entry => {
        if (entry.isDirectory() && entry.name.match(/^\d+--/)) {
          // This is a plan directory, look for plan files inside
          const planDirPath = path.join(dir, entry.name);
          debugLog(`Scanning plan directory: ${planDirPath}`);

          try {
            const planDirEntries = fs.readdirSync(planDirPath, { withFileTypes: true });

            planDirEntries.forEach(planEntry => {
              if (planEntry.isFile() && planEntry.name.match(/^plan-\d+--.*\.md$/)) {
                filesScanned++;
                const filePath = path.join(planDirPath, planEntry.name);
                debugLog(`Processing plan file: ${filePath}`);

                // Extract ID from directory name as primary source
                const dirMatch = entry.name.match(/^(\d+)--/);
                let dirId = null;
                if (dirMatch) {
                  dirId = parseInt(dirMatch[1], 10);
                  if (!isNaN(dirId)) {
                    debugLog(`Extracted ID ${dirId} from directory name: ${entry.name}`);
                    if (dirId > maxId) {
                      maxId = dirId;
                      debugLog(`New max ID from directory name: ${maxId}`);
                    }
                  }
                }

                // Extract ID from filename as secondary source
                const filenameMatch = planEntry.name.match(/^plan-(\d+)--/);
                let filenameId = null;
                if (filenameMatch) {
                  filenameId = parseInt(filenameMatch[1], 10);
                  if (!isNaN(filenameId)) {
                    debugLog(`Extracted ID ${filenameId} from filename: ${planEntry.name}`);
                    if (filenameId > maxId) {
                      maxId = filenameId;
                      debugLog(`New max ID from filename: ${maxId}`);
                    }
                  }
                }

                // Also check frontmatter for most reliable ID
                try {
                  const content = fs.readFileSync(filePath, 'utf8');
                  const frontmatterId = extractIdFromFrontmatter(content, filePath);

                  if (frontmatterId !== null) {
                    debugLog(`Extracted ID ${frontmatterId} from frontmatter: ${filePath}`);
                    if (frontmatterId > maxId) {
                      maxId = frontmatterId;
                      debugLog(`New max ID from frontmatter: ${maxId}`);
                    }

                    // Validate consistency between all sources
                    if (dirId !== null && dirId !== frontmatterId) {
                      errorLog(`ID mismatch in ${filePath}: directory has ${dirId}, frontmatter has ${frontmatterId}`);
                      errorsEncountered++;
                    }
                    if (filenameId !== null && filenameId !== frontmatterId) {
                      errorLog(`ID mismatch in ${filePath}: filename has ${filenameId}, frontmatter has ${frontmatterId}`);
                      errorsEncountered++;
                    }
                  } else {
                    debugLog(`No ID found in frontmatter: ${filePath}`);
                    if (dirId === null && filenameId === null) {
                      errorLog(`No valid ID found in directory, filename, or frontmatter: ${filePath}`);
                      errorsEncountered++;
                    }
                  }
                } catch (err) {
                  errorLog(`Failed to read file ${filePath}: ${err.message}`);
                  errorsEncountered++;
                }
              }
            });
          } catch (err) {
            errorLog(`Failed to read plan directory ${planDirPath}: ${err.message}`);
            errorsEncountered++;
          }
        } else if (entry.isFile() && entry.name.match(/^plan-\d+--.*\.md$/)) {
          // Legacy: direct plan file in plans/archive directory (fallback for old format)
          filesScanned++;
          const filePath = path.join(dir, entry.name);
          debugLog(`Processing legacy plan file: ${filePath}`);

          // Extract ID from filename as fallback
          const filenameMatch = entry.name.match(/^plan-(\d+)--/);
          let filenameId = null;
          if (filenameMatch) {
            filenameId = parseInt(filenameMatch[1], 10);
            if (!isNaN(filenameId)) {
              debugLog(`Extracted ID ${filenameId} from legacy filename: ${entry.name}`);
              if (filenameId > maxId) {
                maxId = filenameId;
                debugLog(`New max ID from legacy filename: ${maxId}`);
              }
            }
          }

          // Also check frontmatter for more reliable ID
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            const frontmatterId = extractIdFromFrontmatter(content, filePath);

            if (frontmatterId !== null) {
              debugLog(`Extracted ID ${frontmatterId} from legacy frontmatter: ${filePath}`);
              if (frontmatterId > maxId) {
                maxId = frontmatterId;
                debugLog(`New max ID from legacy frontmatter: ${maxId}`);
              }

              // Validate consistency between filename and frontmatter
              if (filenameId !== null && filenameId !== frontmatterId) {
                errorLog(`ID mismatch in legacy ${filePath}: filename has ${filenameId}, frontmatter has ${frontmatterId}`);
                errorsEncountered++;
              }
            } else {
              debugLog(`No ID found in legacy frontmatter: ${filePath}`);
              if (filenameId === null) {
                errorLog(`No valid ID found in legacy filename or frontmatter: ${filePath}`);
                errorsEncountered++;
              }
            }
          } catch (err) {
            errorLog(`Failed to read legacy file ${filePath}: ${err.message}`);
            errorsEncountered++;
          }
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          debugLog(`Skipping non-plan file: ${entry.name}`);
        } else if (entry.isDirectory()) {
          debugLog(`Skipping non-plan directory: ${entry.name}`);
        }
      });
    } catch (err) {
      errorLog(`Failed to read directory ${dir}: ${err.message}`);
      errorsEncountered++;
    }
  });

  const nextId = maxId + 1;
  debugLog(`Scan complete. Files scanned: ${filesScanned}, Errors: ${errorsEncountered}, Max ID found: ${maxId}, Next ID: ${nextId}`);

  if (errorsEncountered > 0) {
    errorLog(`Encountered ${errorsEncountered} errors during scan. Next ID calculation may be inaccurate.`);
  }

  return nextId;
}

// Output the next plan ID
console.log(getNextPlanId());