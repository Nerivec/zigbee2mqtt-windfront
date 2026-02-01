#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Detect the currently running AI assistant based on environment variables and directory presence
 * @returns {string} Assistant identifier: 'claude', 'gemini', 'opencode', 'cursor', or 'unknown'
 */
function detectAssistant() {
  // 1. Check environment variables (highest priority)
  if (process.env.CLAUDECODE) {
    return 'claude';
  }

  if (process.env.GEMINI_CODE) {
    return 'gemini';
  }

  if (process.env.OPENCODE) {
    return 'opencode';
  }

  if (process.env.CURSOR) {
    return 'cursor';
  }

  // 2. Check directory presence (fallback)
  const cwd = process.cwd();

  const assistantDirs = [
    { name: 'claude', dir: '.claude' },
    { name: 'gemini', dir: '.gemini' },
    { name: 'opencode', dir: '.opencode' },
    { name: 'cursor', dir: '.cursor' }
  ];

  for (const { name, dir } of assistantDirs) {
    const dirPath = path.join(cwd, dir);

    try {
      if (fs.existsSync(dirPath)) {
        const stats = fs.statSync(dirPath);
        if (stats.isDirectory()) {
          return name;
        }
      }
    } catch (err) {
      // Handle filesystem errors gracefully (e.g., permission issues)
      continue;
    }
  }

  // 3. Default: unknown
  return 'unknown';
}

// Main execution with error handling
try {
  const assistant = detectAssistant();
  console.log(assistant);
  process.exit(0);
} catch (error) {
  // Graceful degradation: output 'unknown' even on error
  console.log('unknown');
  process.exit(0);
}
