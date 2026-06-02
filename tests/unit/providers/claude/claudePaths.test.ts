import * as os from 'os';
import * as path from 'path';

import {
  getClaudeHomeDirName,
  getGlobalClaudeHome,
  getGlobalClaudePath,
  getVaultClaudeDir,
  getVaultClaudePath,
  isValidClaudeHomeDirName,
  setClaudeHomeDirName,
} from '@/providers/claude/claudePaths';

describe('claudePaths', () => {
  afterEach(() => {
    setClaudeHomeDirName('.claude');
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

    it('uses the custom dir name', () => {
      setClaudeHomeDirName('.claude-internal');
      expect(getGlobalClaudePath('agents')).toBe(
        path.join(os.homedir(), '.claude-internal', 'agents'),
      );
    });
  });

  describe('getVaultClaudeDir / getVaultClaudePath', () => {
    it('returns vault-relative defaults', () => {
      expect(getVaultClaudeDir()).toBe('.claude');
      expect(getVaultClaudePath('settings.json')).toBe('.claude/settings.json');
    });

    it('uses the custom dir name', () => {
      setClaudeHomeDirName('.claude-internal');
      expect(getVaultClaudeDir()).toBe('.claude-internal');
      expect(getVaultClaudePath('sessions', 'abc.jsonl')).toBe('.claude-internal/sessions/abc.jsonl');
    });
  });

  describe('dynamic path functions in Claude storage modules', () => {
    it('getCCSettingsPath responds to dir name changes', async () => {
      const { getCCSettingsPath } = await import('@/providers/claude/storage/CCSettingsStorage');
      expect(getCCSettingsPath()).toBe('.claude/settings.json');

      setClaudeHomeDirName('.claude-internal');
      expect(getCCSettingsPath()).toBe('.claude-internal/settings.json');
    });

    it('getAgentsPath / getSkillsPath / getCommandsPath / getMcpConfigPath respond to dir name changes', async () => {
      const { getAgentsPath } = await import('@/providers/claude/storage/AgentVaultStorage');
      const { getSkillsPath } = await import('@/providers/claude/storage/SkillStorage');
      const { getCommandsPath } = await import('@/providers/claude/storage/SlashCommandStorage');
      const { getMcpConfigPath } = await import('@/providers/claude/storage/McpStorage');

      setClaudeHomeDirName('.claude-internal');
      expect(getAgentsPath()).toBe('.claude-internal/agents');
      expect(getSkillsPath()).toBe('.claude-internal/skills');
      expect(getCommandsPath()).toBe('.claude-internal/commands');
      expect(getMcpConfigPath()).toBe('.claude-internal/mcp.json');
    });

    it('getSDKProjectsPath responds to dir name changes', async () => {
      const { getSDKProjectsPath } = await import('@/providers/claude/history/sdkSessionPaths');
      expect(getSDKProjectsPath()).toBe(path.join(os.homedir(), '.claude', 'projects'));

      setClaudeHomeDirName('.claude-internal');
      expect(getSDKProjectsPath()).toBe(path.join(os.homedir(), '.claude-internal', 'projects'));
    });
  });
});
