import * as os from 'os';
import * as path from 'path';

let _globalDirName = '.claude';
let _vaultDirName = '.claude';

/**
 * Validates a Claude home directory name. Rejects empty, '.', '..',
 * non-dot-prefixed, and separator-containing names so the value is always a
 * safe single dotfile directory under the home/vault root.
 */
export function isValidClaudeHomeDirName(dirName: string): boolean {
  if (!dirName || dirName === '.' || dirName === '..') return false;
  if (!dirName.startsWith('.')) return false;
  if (dirName.includes('/') || dirName.includes('\\')) return false;
  return true;
}

/** Sets the global Claude home directory name, e.g. '.claude-internal'. */
export function setClaudeHomeDirName(dirName: string): void {
  if (!isValidClaudeHomeDirName(dirName)) return;
  _globalDirName = dirName;
}

/** Returns the global Claude home directory name. */
export function getClaudeHomeDirName(): string {
  return _globalDirName;
}

/**
 * Sets the vault-level Claude config directory name. Decoupled from the global
 * home name so a custom global home (e.g. ~/.claude-internal/) can coexist with
 * the conventional in-vault `.claude/` directory.
 */
export function setClaudeVaultDirName(dirName: string): void {
  if (!isValidClaudeHomeDirName(dirName)) return;
  _vaultDirName = dirName;
}

/** Returns the vault-level Claude config directory name. */
export function getClaudeVaultDirName(): string {
  return _vaultDirName;
}

/** Global Claude home directory, e.g. ~/.claude/ or ~/.claude-internal/ */
export function getGlobalClaudeHome(): string {
  return path.join(os.homedir(), _globalDirName);
}

/** Path under the global Claude home, e.g. ~/.claude/agents */
export function getGlobalClaudePath(...segments: string[]): string {
  return path.join(os.homedir(), _globalDirName, ...segments);
}

/** Vault-relative Claude directory name, e.g. '.claude' or '.claude-internal' */
export function getVaultClaudeDir(): string {
  return _vaultDirName;
}

/** Vault-relative path under the Claude directory, e.g. '.claude/settings.json' */
export function getVaultClaudePath(...segments: string[]): string {
  return [_vaultDirName, ...segments].join('/');
}
