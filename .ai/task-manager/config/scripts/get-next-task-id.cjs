#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Find the task manager root directory by traversing up from CWD
 * @returns {string|null} Path to task manager root or null if not found
 */
function findTaskManagerRoot() {
  let currentPath = process.cwd();
  const root = path.parse(currentPath).root;

  while (currentPath !== root) {
    const taskManagerPath = path.join(currentPath, '.ai', 'task-manager', 'plans');
    if (fs.existsSync(taskManagerPath)) {
      return path.join(currentPath, '.ai', 'task-manager');
    }
    currentPath = path.dirname(currentPath);
  }

  // Check root directory as well
  const rootTaskManager = path.join(root, '.ai', 'task-manager', 'plans');
  if (fs.existsSync(rootTaskManager)) {
    return path.join(root, '.ai', 'task-manager');
  }

  return null;
}

/**
 * Parse YAML frontmatter for ID with resilience to different formats
 * @param {string} content - File content
 * @returns {number|null} Extracted ID or null
 */
function extractIdFromFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;

  const frontmatterText = frontmatterMatch[1];

  // Handle various YAML formats for id field using regex:
  // id: 5
  // id: "5"
  // id: '5'
  // "id": 5
  // 'id': 5
  // id : 5 (with spaces)
  const patterns = [
    /^\s*["']?id["']?\s*:\s*["']?(\d+)["']?\s*$/m,  // Most flexible pattern
    /^\s*id\s*:\s*(\d+)\s*$/m,                       // Simple numeric
    /^\s*id\s*:\s*"(\d+)"\s*$/m,                     // Double quoted
    /^\s*id\s*:\s*'(\d+)'\s*$/m,                     // Single quoted
  ];

  for (const pattern of patterns) {
    const match = frontmatterText.match(pattern);
    if (match) {
      const id = parseInt(match[1], 10);
      if (!isNaN(id)) return id;
    }
  }

  return null;
}

/**
 * Get the next available task ID for a specific plan
 * @param {number|string} planId - The plan ID to get next task ID for
 * @returns {number} Next available task ID
 */
function getNextTaskId(planId) {
  if (!planId) {
    console.error('Error: Plan ID is required');
    process.exit(1);
  }

  const taskManagerRoot = findTaskManagerRoot();

  if (!taskManagerRoot) {
    console.error('Error: No .ai/task-manager/plans directory found in current directory or any parent directory.');
    console.error('Please ensure you are in a project with task manager initialized.');
    process.exit(1);
  }

  const plansDir = path.join(taskManagerRoot, 'plans');

  // Find the plan directory (supports both padded and unpadded formats)
  const paddedPlanId = String(planId).padStart(2, '0');

  let planDir = null;

  // Optimization: 90% of the time there are no tasks, so check if plans directory exists first
  if (!fs.existsSync(plansDir)) {
    return 1; // No plans directory = no tasks = start with ID 1
  }

  try {
    const entries = fs.readdirSync(plansDir, { withFileTypes: true });

    // Look for directory matching the plan ID pattern
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const match = entry.name.match(/^(\d+)--/);
        if (match) {
          const dirPlanId = match[1].padStart(2, '0');
          if (dirPlanId === paddedPlanId) {
            const tasksPath = path.join(plansDir, entry.name, 'tasks');
            if (fs.existsSync(tasksPath)) {
              planDir = tasksPath;
            }
            break;
          }
        }
      }
    }
  } catch (err) {
    // Directory doesn't exist or can't be read
  }

  // Optimization: If no tasks directory exists, return 1 immediately (90% case)
  if (!planDir) {
    return 1;
  }

  let maxId = 0;

  try {
    const entries = fs.readdirSync(planDir, { withFileTypes: true });

    // Another optimization: If directory is empty, return 1 immediately
    if (entries.length === 0) {
      return 1;
    }

    entries.forEach(entry => {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const filePath = path.join(planDir, entry.name);
          const content = fs.readFileSync(filePath, 'utf8');
          const id = extractIdFromFrontmatter(content);

          if (id !== null && id > maxId) {
            maxId = id;
          }
        } catch (err) {
          // Skip corrupted files
        }
      }
    });
  } catch (err) {
    // Skip directories that can't be read
  }

  return maxId + 1;
}

// Get plan ID from command line argument
const planId = process.argv[2];
console.log(getNextTaskId(planId));