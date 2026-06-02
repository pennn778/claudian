import type { ProviderCapabilities } from '../../core/providers/types';
import { getClaudeHomeDirName } from './claudePaths';

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
  // Resolved lazily so a configured Claude home directory name (e.g.
  // `.claude-internal`) is reflected in plan-file path detection.
  get planPathPrefix(): string {
    return `/${getClaudeHomeDirName()}/plans/`;
  },
});
