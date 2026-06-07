import * as os from 'os';
import * as path from 'path';

import {
  getClaudeHomeDirName,
  getClaudeVaultDirName,
  getGlobalClaudeHome,
  getGlobalClaudePath,
  getVaultClaudeDir,
  getVaultClaudePath,
  isValidClaudeHomeDirName,
  setClaudeHomeDirName,
  setClaudeVaultDirName,
} from '@/providers/claude/claudePaths';

describe('claudePaths', () => {
  afterEach(() => {
    setClaudeHomeDirName('.claude');
    setClaudeVaultDirName('.claude');
  });

  describe('isValidClaudeHomeDirName', () => {
    it('accepts dot-prefixed names without separators', () => {
      expect(isValidClaudeHomeDirName('.claude')).toBe(true);
      expect(isValidClaudeHomeDirName('.claude-internal')).toBe(true);
    });

    it('rejects empty, dot, double-dot, non-dot, and separator names', () => {
      expect(isValidClaudeHomeDirName('')).toBe(false);
      expect(isValidClaudeHomeDirName('.')).toBe(false);
      expect(isValidClaudeHomeDirName('..')).toBe(false);
      expect(isValidClaudeHomeDirName('claude')).toBe(false);
      expect(isValidClaudeHomeDirName('.claude/sub')).toBe(false);
      expect(isValidClaudeHomeDirName('.claude\\sub')).toBe(false);
    });
  });

  describe('setClaudeHomeDirName / getClaudeHomeDirName', () => {
    it('defaults to .claude', () => {
      expect(getClaudeHomeDirName()).toBe('.claude');
    });

    it('can be set to a valid custom value', () => {
      setClaudeHomeDirName('.claude-internal');
      expect(getClaudeHomeDirName()).toBe('.claude-internal');
    });

    it('ignores invalid values', () => {
      setClaudeHomeDirName('.claude-internal');
      setClaudeHomeDirName('invalid/name');
      expect(getClaudeHomeDirName()).toBe('.claude-internal');
    });

    it('does not affect the vault directory name', () => {
      setClaudeHomeDirName('.claude-internal');
      expect(getClaudeVaultDirName()).toBe('.claude');
      expect(getVaultClaudeDir()).toBe('.claude');
    });
  });

  describe('setClaudeVaultDirName / getClaudeVaultDirName', () => {
    it('defaults to .claude', () => {
      expect(getClaudeVaultDirName()).toBe('.claude');
    });

    it('can be set independently of the global home name', () => {
      setClaudeVaultDirName('.claude-internal');
      expect(getClaudeVaultDirName()).toBe('.claude-internal');
      expect(getClaudeHomeDirName()).toBe('.claude');
    });

    it('ignores invalid values', () => {
      setClaudeVaultDirName('.claude-internal');
      setClaudeVaultDirName('invalid/name');
      expect(getClaudeVaultDirName()).toBe('.claude-internal');
    });
  });

  describe('getGlobalClaudeHome', () => {
    it('returns ~/.claude by default', () => {
      expect(getGlobalClaudeHome()).toBe(path.join(os.homedir(), '.claude'));
    });

    it('returns ~/.claude-internal when configured', () => {
      setClaudeHomeDirName('.claude-internal');
      expect(getGlobalClaudeHome()).toBe(path.join(os.homedir(), '.claude-internal'));
    });
  });

  describe('getGlobalClaudePath', () => {
    it('joins multiple segments under global home', () => {
      expect(getGlobalClaudePath('plugins', 'installed_plugins.json')).toBe(
        path.join(os.homedir(), '.claude', 'plugins', 'installed_plugins.json'),
      );
    });

    it('uses the custom global dir name', () => {
      setClaudeHomeDirName('.claude-internal');
      expect(getGlobalClaudePath('agents')).toBe(
        path.join(os.homedir(), '.claude-internal', 'agents'),
      );
    });

    it('is unaffected by the vault dir name', () => {
      setClaudeVaultDirName('.claude-internal');
      expect(getGlobalClaudePath('agents')).toBe(
        path.join(os.homedir(), '.claude', 'agents'),
      );
    });
  });

  describe('getVaultClaudeDir / getVaultClaudePath', () => {
    it('returns vault-relative defaults', () => {
      expect(getVaultClaudeDir()).toBe('.claude');
      expect(getVaultClaudePath('settings.json')).toBe('.claude/settings.json');
    });

    it('uses the custom vault dir name', () => {
      setClaudeVaultDirName('.claude-internal');
      expect(getVaultClaudeDir()).toBe('.claude-internal');
      expect(getVaultClaudePath('sessions', 'abc.jsonl')).toBe('.claude-internal/sessions/abc.jsonl');
    });

    it('is unaffected by the global home name', () => {
      setClaudeHomeDirName('.claude-internal');
      expect(getVaultClaudeDir()).toBe('.claude');
      expect(getVaultClaudePath('settings.json')).toBe('.claude/settings.json');
    });
  });

  describe('dynamic path functions in Claude storage modules', () => {
    it('getCCSettingsPath responds to vault dir name changes', async () => {
      const { getCCSettingsPath } = await import('@/providers/claude/storage/CCSettingsStorage');
      expect(getCCSettingsPath()).toBe('.claude/settings.json');

      setClaudeVaultDirName('.claude-internal');
      expect(getCCSettingsPath()).toBe('.claude-internal/settings.json');
    });

    it('getAgentsPath / getSkillsPath / getCommandsPath / getMcpConfigPath respond to vault dir name changes', async () => {
      const { getAgentsPath } = await import('@/providers/claude/storage/AgentVaultStorage');
      const { getSkillsPath } = await import('@/providers/claude/storage/SkillStorage');
      const { getCommandsPath } = await import('@/providers/claude/storage/SlashCommandStorage');
      const { getMcpConfigPath } = await import('@/providers/claude/storage/McpStorage');

      setClaudeVaultDirName('.claude-internal');
      expect(getAgentsPath()).toBe('.claude-internal/agents');
      expect(getSkillsPath()).toBe('.claude-internal/skills');
      expect(getCommandsPath()).toBe('.claude-internal/commands');
      expect(getMcpConfigPath()).toBe('.claude-internal/mcp.json');
    });

    it('getSDKProjectsPath responds to global dir name changes', async () => {
      const { getSDKProjectsPath } = await import('@/providers/claude/history/sdkSessionPaths');
      expect(getSDKProjectsPath()).toBe(path.join(os.homedir(), '.claude', 'projects'));

      setClaudeHomeDirName('.claude-internal');
      expect(getSDKProjectsPath()).toBe(path.join(os.homedir(), '.claude-internal', 'projects'));
    });
  });
});
