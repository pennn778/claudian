import type { ProviderCapabilities } from '../../core/providers/types';
import { getVaultClaudeDir } from './claudePaths';

export const CLAUDE_PROVIDER_CAPABILITIES: Readonly<ProviderCapabilities> = Object.freeze({
  providerId: 'claude',
  supportsPersistentRuntime: true,
  supportsNativeHistory: true,
  supportsPlanMode: true,
  supportsRewind: true,
  supportsFork: true,
  supportsProviderCommands: true,
  supportsImageAttachments: true,
  supportsInstructionMode: true,
  supportsMcpTools: true,
  supportsTurnSteer: false,
  reasoningControl: 'effort',
  // Plans live in the vault, so this tracks the vault config directory name
  // (e.g. `.claude-internal`) rather than the global home name.
  get planPathPrefix(): string {
    return `/${getVaultClaudeDir()}/plans/`;
  },
});
