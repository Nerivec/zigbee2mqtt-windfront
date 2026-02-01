#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration path mapping
const CONFIG_PATHS = {
  claude: {
    global: [path.join(os.homedir(), '.claude', 'CLAUDE.md')],
    project: ['AGENTS.md', 'CLAUDE.md']
  },
  gemini: {
    global: [path.join(os.homedir(), '.gemini', 'GEMINI.md')],
    project: ['.gemini/styleguide.md']
  },
  opencode: {
    global: [path.join(os.homedir(), '.opencode', 'OPENCODE.md')],
    project: ['AGENTS.md', 'OPENCODE.md']
  },
  cursor: {
    global: [path.join(os.homedir(), '.cursor', 'rules', 'index.mdc')],
    project: ['.cursor/index.mdc']
  }
};

function readConfigFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return content.trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

function readAssistantConfig(assistant) {
  const configs = CONFIG_PATHS[assistant];

  if (!configs) {
    return '';
  }

  const output = [];

  // Read global configs
  let globalContent = null;
  for (const globalPath of configs.global) {
    const content = readConfigFile(globalPath);
    if (content) {
      globalContent = content;
      break; // Use first found
    }
  }

  if (globalContent) {
    output.push('## Global Assistant Configuration\n');
    output.push(globalContent);
    output.push('\n');
  }

  // Read project configs
  let projectContent = null;
  for (const projectPath of configs.project) {
    const fullPath = path.join(process.cwd(), projectPath);
    const content = readConfigFile(fullPath);
    if (content) {
      projectContent = content;
      break; // Use first found
    }
  }

  if (projectContent) {
    output.push('## Project-Level Configuration\n');
    output.push(projectContent);
    output.push('\n');
  }

  return output.join('\n');
}

// Main execution
const assistant = process.argv[2];

if (!assistant) {
  process.exit(0); // Silent exit for graceful degradation
}

try {
  const config = readAssistantConfig(assistant);
  if (config) {
    console.log(config);
  }
  process.exit(0);
} catch (error) {
  process.exit(0); // Graceful degradation
}
