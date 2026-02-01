#!/usr/bin/env node

/**
 * Runtime Prompt Composition Script
 *
 * Reads markdown command files, performs variable substitution, and outputs
 * composed prompts to enable uninterrupted workflow execution.
 *
 * Usage:
 *   node compose-prompt.cjs --template "create-plan.md" --variable "ARGUMENTS=user input" --variable "1=51"
 *
 * Arguments:
 *   --template: Relative path to template file (e.g., "create-plan.md")
 *   --variable: Key=value pairs for substitution (can be specified multiple times)
 *
 * Output:
 *   Composed markdown prompt to stdout with variables substituted
 *
 * Exit Codes:
 *   0: Success
 *   1: Error (with message to stderr)
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse command line arguments
 * @returns {Object} Parsed arguments with template and variables
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const result = {
    template: null,
    variables: {}
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--template') {
      if (i + 1 >= args.length) {
        throw new Error('--template requires a value');
      }
      result.template = args[++i];
    } else if (args[i] === '--variable') {
      if (i + 1 >= args.length) {
        throw new Error('--variable requires a value');
      }
      const varArg = args[++i];
      const eqIndex = varArg.indexOf('=');
      if (eqIndex === -1) {
        throw new Error(`Invalid variable format: ${varArg}. Expected format: key=value`);
      }
      const key = varArg.substring(0, eqIndex);
      const value = varArg.substring(eqIndex + 1);
      result.variables[key] = value;
    } else {
      throw new Error(`Unknown argument: ${args[i]}`);
    }
  }

  if (!result.template) {
    throw new Error('--template argument is required');
  }

  return result;
}

/**
 * Find the template file in the appropriate directory
 * Priority: .claude/commands/tasks/ then templates/assistant/commands/tasks/
 * @param {string} templateName - Relative path to template file
 * @returns {string} Absolute path to template file
 */
function findTemplateFile(templateName) {
  // Get the root directory (assuming script is in templates/ai-task-manager/config/scripts/)
  const scriptDir = __dirname;
  const rootDir = path.resolve(scriptDir, '../../../..');

  // Define search paths in priority order
  const searchPaths = [
    path.join(rootDir, '.claude', 'commands', 'tasks', templateName),
    path.join(rootDir, 'templates', 'assistant', 'commands', 'tasks', templateName)
  ];

  for (const searchPath of searchPaths) {
    if (fs.existsSync(searchPath)) {
      return searchPath;
    }
  }

  throw new Error(`Template not found: ${templateName}`);
}

/**
 * Parse YAML frontmatter from markdown content
 * Based on the parseFrontmatter function from src/utils.ts
 * @param {string} content - The markdown content with frontmatter
 * @returns {Object} Object containing frontmatter and body content
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n([\s\S]*))?$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {
      frontmatter: {},
      body: content
    };
  }

  const frontmatterContent = match[1] || '';
  const bodyContent = match[2] || '';

  // Simple YAML parser for our specific use case
  const frontmatter = {};
  const lines = frontmatterContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.substring(0, colonIndex).trim();
    const value = trimmed.substring(colonIndex + 1).trim();

    // Remove quotes if present
    frontmatter[key] = value.replace(/^["']|["']$/g, '');
  }

  return {
    frontmatter,
    body: bodyContent
  };
}

/**
 * Perform variable substitution in the template body
 * Replaces $ARGUMENTS, $1, $2, etc. with provided values
 * Does NOT process frontmatter variables (those stay as-is)
 * @param {string} body - The template body content
 * @param {Object} variables - Key-value pairs for substitution
 * @returns {string} Body content with substitutions applied
 */
function substituteVariables(body, variables) {
  let result = body;

  // Replace $ARGUMENTS if provided
  if (variables.ARGUMENTS !== undefined) {
    // Use regex with negative lookahead to avoid replacing $ARGUMENTS that are part of longer identifiers
    result = result.replace(/\$ARGUMENTS(?![0-9A-Za-z_])/g, variables.ARGUMENTS);
  }

  // Replace positional arguments ($1, $2, $3, etc.)
  // Use regex with negative lookahead to avoid replacing $1 that's part of $10, etc.
  for (const key in variables) {
    if (/^\d+$/.test(key)) {
      const pattern = new RegExp(`\\$${key}(?![0-9])`, 'g');
      result = result.replace(pattern, variables[key]);
    }
  }

  return result;
}

/**
 * Reconstruct markdown content with frontmatter
 * @param {Object} frontmatter - The frontmatter object
 * @param {string} body - The body content
 * @returns {string} Complete markdown content
 */
function reconstructMarkdown(frontmatter, body) {
  if (Object.keys(frontmatter).length === 0) {
    return body;
  }

  let result = '---\n';
  for (const [key, value] of Object.entries(frontmatter)) {
    // Preserve original formatting - add quotes if value contains special characters
    if (typeof value === 'string' && (value.includes(':') || value.includes('[') || value.includes(']'))) {
      result += `${key}: "${value}"\n`;
    } else {
      result += `${key}: ${value}\n`;
    }
  }
  result += '---\n';

  if (body) {
    result += body;
  }

  return result;
}

/**
 * Main execution function
 */
function main() {
  try {
    // Parse command line arguments
    const { template, variables } = parseArguments();

    // Find the template file
    const templatePath = findTemplateFile(template);

    // Read the template file
    const content = fs.readFileSync(templatePath, 'utf-8');

    // Parse frontmatter and body
    const { frontmatter, body } = parseFrontmatter(content);

    // Perform variable substitution on the body only
    const substitutedBody = substituteVariables(body, variables);

    // Reconstruct the markdown with frontmatter preserved
    const output = reconstructMarkdown(frontmatter, substitutedBody);

    // Output to stdout
    process.stdout.write(output);

    // Exit successfully
    process.exit(0);
  } catch (error) {
    // Write error to stderr
    process.stderr.write(`Error: ${error.message}\n`);

    // Exit with error code
    process.exit(1);
  }
}

// Execute main function
main();
