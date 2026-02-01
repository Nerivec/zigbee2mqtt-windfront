#!/usr/bin/env node

/**
 * Script: check-task-dependencies.cjs
 * Purpose: Check if a task has all of its dependencies resolved (completed)
 * Usage: node check-task-dependencies.cjs <plan-id> <task-id>
 * Returns: 0 if all dependencies are resolved, 1 if not
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Chalk instance - loaded dynamically to handle ESM module
let chalkInstance = null;

// Initialize chalk instance dynamically
async function initChalk() {
    if (chalkInstance) return chalkInstance;

    try {
        const { default: chalk } = await import('chalk');
        chalkInstance = chalk;
    } catch (_error) {
        // Chalk not available, will fall back to plain console output
        chalkInstance = null;
    }

    return chalkInstance;
}

// Color functions for output
const printError = (message, chalk) => {
    const formattedMessage = chalk?.red(`ERROR: ${message}`) || `ERROR: ${message}`;
    console.error(formattedMessage);
};

const printSuccess = (message, chalk) => {
    const formattedMessage = chalk?.green(`✓ ${message}`) || `✓ ${message}`;
    console.log(formattedMessage);
};

const printWarning = (message, chalk) => {
    const formattedMessage = chalk?.yellow(`⚠ ${message}`) || `⚠ ${message}`;
    console.log(formattedMessage);
};

const printInfo = (message) => {
    console.log(message);
};

// Function to find plan directory
const findPlanDirectory = (planId) => {
    const searchLocations = [
        '.ai/task-manager/plans',
        '.ai/task-manager/archive'
    ];

    // Generate ID variations to try (exact, padded, unpadded)
    const idVariations = [
        planId,                           // Try exact match first
        planId.padStart(2, '0'),          // Try padded version (3 → 03)
        planId.replace(/^0+/, '') || '0'  // Try unpadded version (03 → 3)
    ];

    // Remove duplicates from variations array
    const uniqueVariations = [...new Set(idVariations)];

    // Search for each variation in each location
    for (const id of uniqueVariations) {
        for (const location of searchLocations) {
            try {
                const findCommand = `find ${location} -type d -name "${id}--*" 2>/dev/null || true`;
                const result = execSync(findCommand, { encoding: 'utf8' }).trim();
                const directories = result.split('\n').filter(dir => dir.length > 0);

                if (directories.length > 0) {
                    return directories[0]; // Early return on first match
                }
            } catch (error) {
                // Continue trying other variations/locations
                continue;
            }
        }
    }

    return null; // No matches found
};

// Function to find task file with padded/unpadded ID handling
const findTaskFile = (planDir, taskId) => {
    const taskDir = path.join(planDir, 'tasks');

    if (!fs.existsSync(taskDir)) {
        return null;
    }

    // Try exact match first
    let pattern = `${taskId}--*.md`;
    let files = fs.readdirSync(taskDir).filter(file => {
        const regex = new RegExp(`^${taskId}--.*\\.md$`);
        return regex.test(file);
    });

    if (files.length > 0) {
        return path.join(taskDir, files[0]);
    }

    // Try with zero-padding if direct match fails
    const paddedTaskId = taskId.padStart(2, '0');
    if (paddedTaskId !== taskId) {
        pattern = `${paddedTaskId}--*.md`;
        files = fs.readdirSync(taskDir).filter(file => {
            const regex = new RegExp(`^${paddedTaskId}--.*\\.md$`);
            return regex.test(file);
        });

        if (files.length > 0) {
            return path.join(taskDir, files[0]);
        }
    }

    // Try removing potential zero-padding from taskId
    const unpaddedTaskId = taskId.replace(/^0+/, '') || '0';
    if (unpaddedTaskId !== taskId) {
        pattern = `${unpaddedTaskId}--*.md`;
        files = fs.readdirSync(taskDir).filter(file => {
            const regex = new RegExp(`^${unpaddedTaskId}--.*\\.md$`);
            return regex.test(file);
        });

        if (files.length > 0) {
            return path.join(taskDir, files[0]);
        }

        // Try with zero-padding of unpadded version
        const repaddedTaskId = unpaddedTaskId.padStart(2, '0');
        pattern = `${repaddedTaskId}--*.md`;
        files = fs.readdirSync(taskDir).filter(file => {
            const regex = new RegExp(`^${repaddedTaskId}--.*\\.md$`);
            return regex.test(file);
        });

        if (files.length > 0) {
            return path.join(taskDir, files[0]);
        }
    }

    return null;
};

// Function to parse YAML frontmatter
const parseFrontmatter = (content) => {
    const lines = content.split('\n');
    let inFrontmatter = false;
    let frontmatterEnd = false;
    let delimiterCount = 0;
    const frontmatterLines = [];

    for (const line of lines) {
        if (line.trim() === '---') {
            delimiterCount++;
            if (delimiterCount === 1) {
                inFrontmatter = true;
                continue;
            } else if (delimiterCount === 2) {
                frontmatterEnd = true;
                break;
            }
        }

        if (inFrontmatter && !frontmatterEnd) {
            frontmatterLines.push(line);
        }
    }

    return frontmatterLines.join('\n');
};

// Function to extract dependencies from frontmatter
const extractDependencies = (frontmatter) => {
    const lines = frontmatter.split('\n');
    const dependencies = [];
    let inDependenciesSection = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check for dependencies line
        if (line.match(/^dependencies:/)) {
            inDependenciesSection = true;

            // Check if dependencies are on the same line (array syntax)
            const arrayMatch = line.match(/\[(.*)\]/);
            if (arrayMatch) {
                const deps = arrayMatch[1]
                    .split(',')
                    .map(dep => dep.trim().replace(/['"]/g, ''))
                    .filter(dep => dep.length > 0);
                dependencies.push(...deps);
                inDependenciesSection = false;
            }
            continue;
        }

        // If we're in dependencies section and hit a non-indented line that's not a list item, exit
        if (inDependenciesSection && line.match(/^[^ ]/) && !line.match(/^[ \t]*-/)) {
            inDependenciesSection = false;
        }

        // Parse list format dependencies
        if (inDependenciesSection && line.match(/^[ \t]*-/)) {
            const dep = line.replace(/^[ \t]*-[ \t]*/, '').replace(/[ \t]*$/, '').replace(/['"]/g, '');
            if (dep.length > 0) {
                dependencies.push(dep);
            }
        }
    }

    return dependencies;
};

// Function to extract status from frontmatter
const extractStatus = (frontmatter) => {
    const lines = frontmatter.split('\n');

    for (const line of lines) {
        if (line.match(/^status:/)) {
            return line.replace(/^status:[ \t]*/, '').replace(/^["']/, '').replace(/["']$/, '').trim();
        }
    }

    return null;
};

// Main function
const main = async () => {
    // Initialize chalk
    const chalk = await initChalk();

    // Check arguments
    if (process.argv.length !== 4) {
        printError('Invalid number of arguments', chalk);
        console.log('Usage: node check-task-dependencies.cjs <plan-id> <task-id>');
        console.log('Example: node check-task-dependencies.cjs 16 03');
        process.exit(1);
    }

    const planId = process.argv[2];
    const taskId = process.argv[3];

    // Find the plan directory
    const planDir = findPlanDirectory(planId);

    if (!planDir) {
        printError(`Plan with ID ${planId} not found`, chalk);
        process.exit(1);
    }

    printInfo(`Found plan directory: ${planDir}`);

    // Find task file
    const taskFile = findTaskFile(planDir, taskId);

    if (!taskFile || !fs.existsSync(taskFile)) {
        printError(`Task with ID ${taskId} not found in plan ${planId}`, chalk);
        process.exit(1);
    }

    printInfo(`Checking task: ${path.basename(taskFile)}`);
    console.log('');

    // Read and parse task file
    const taskContent = fs.readFileSync(taskFile, 'utf8');
    const frontmatter = parseFrontmatter(taskContent);
    const dependencies = extractDependencies(frontmatter);

    // Check if there are any dependencies
    if (dependencies.length === 0) {
        printSuccess('Task has no dependencies - ready to execute!', chalk);
        process.exit(0);
    }

    // Display dependencies
    printInfo('Task dependencies found:');
    dependencies.forEach(dep => {
        console.log(`  - Task ${dep}`);
    });
    console.log('');

    // Check each dependency
    let allResolved = true;
    let unresolvedDeps = [];
    let resolvedCount = 0;
    const totalDeps = dependencies.length;

    printInfo('Checking dependency status...');
    console.log('');

    for (const depId of dependencies) {
        // Find dependency task file
        const depFile = findTaskFile(planDir, depId);

        if (!depFile || !fs.existsSync(depFile)) {
            printError(`Dependency task ${depId} not found`, chalk);
            allResolved = false;
            unresolvedDeps.push(`${depId} (not found)`);
            continue;
        }

        // Extract status from dependency task
        const depContent = fs.readFileSync(depFile, 'utf8');
        const depFrontmatter = parseFrontmatter(depContent);
        const status = extractStatus(depFrontmatter);

        // Check if status is completed
        if (status === 'completed') {
            printSuccess(`Task ${depId} - Status: completed ✓`, chalk);
            resolvedCount++;
        } else {
            printWarning(`Task ${depId} - Status: ${status || 'unknown'} ✗`, chalk);
            allResolved = false;
            unresolvedDeps.push(`${depId} (${status || 'unknown'})`);
        }
    }

    console.log('');
    printInfo('=========================================');
    printInfo('Dependency Check Summary');
    printInfo('=========================================');
    printInfo(`Total dependencies: ${totalDeps}`);
    printInfo(`Resolved: ${resolvedCount}`);
    printInfo(`Unresolved: ${totalDeps - resolvedCount}`);
    console.log('');

    if (allResolved) {
        printSuccess(`All dependencies are resolved! Task ${taskId} is ready to execute.`, chalk);
        process.exit(0);
    } else {
        printError(`Task ${taskId} has unresolved dependencies:`, chalk);
        unresolvedDeps.forEach(dep => {
            console.log(dep);
        });
        printInfo('Please complete the dependencies before executing this task.');
        process.exit(1);
    }
};

// Run the script
if (require.main === module) {
    main().catch((error) => {
        console.error('Script execution failed:', error);
        process.exit(1);
    });
}

module.exports = { main };