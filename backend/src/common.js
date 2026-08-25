// common.js - utility functions for backend development
// This file is an ES module (type: module is set in package.json)

/**
 * Simple logger utility that prefixes messages with a timestamp.
 * @param {string} level - Log level (e.g., 'info', 'warn', 'error')
 * @param {any} message - Message or object to log
 */
export function log(level, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}]`, message);
}

/**
 * Returns a promise that resolves after the specified number of milliseconds.
 * Useful for delaying execution in async functions.
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parses a JSON string safely, returning null if parsing fails.
 * @param {string} jsonString
 * @returns {any|null}
 */
export function safeParseJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (_) {
    return null;
  }
}
