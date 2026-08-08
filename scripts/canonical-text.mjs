// SPDX-License-Identifier: MIT

/**
 * Normalize text before hashing so the canonical digest is independent of
 * Windows CRLF, classic Mac CR, or Unix LF working-tree line endings.
 */
export function normalizeTextForDigest(value) {
  return value.replace(/\r\n?/g, "\n");
}
