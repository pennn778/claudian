import {
  getClaudeModelOptions,
  getRuntimeDetectedClaudeModels,
  setRuntimeDetectedClaudeModels,
} from '@/providers/claude/modelOptions';
import { toClaudeRuntimeModelId } from '@/providers/claude/modelSelection';

describe('modelOptions runtime-detected models', () => {
  afterEach(() => {
    setRuntimeDetectedClaudeModels([]);
  });

  it('defaults to an empty runtime-detected list', () => {
    expect(getRuntimeDetectedClaudeModels()).toEqual([]);
  });

  it('returns the hardcoded defaults when nothing is detected or configured', () => {
    const options = getClaudeModelOptions({});
    expect(options.length).toBeGreaterThan(0);
    expect(options.some((o) => o.value === 'sonnet' || o.value === 'opus' || o.value === 'haiku')).toBe(true);
  });

  it('prefers runtime-detected models over the hardcoded defaults', () => {
    setRuntimeDetectedClaudeModels([
      { value: 'internal-sonnet', label: 'Internal Sonnet', description: 'Custom' },
      { value: 'internal-opus', label: 'Internal Opus', description: 'Custom' },
    ]);

    const options = getClaudeModelOptions({});
    expect(options).toEqual([
      { value: 'internal-sonnet', label: 'Internal Sonnet', description: 'Custom' },
      { value: 'internal-opus', label: 'Internal Opus', description: 'Custom' },
    ]);
  });

  it('lets explicit env-configured custom models take precedence over runtime-detected ones', () => {
    setRuntimeDetectedClaudeModels([
      { value: 'internal-opus', label: 'Internal Opus', description: 'Custom' },
    ]);

    const options = getClaudeModelOptions({
      providerConfigs: {
        claude: { environmentVariables: 'ANTHROPIC_MODEL=env-model' },
      },
    });

    expect(options.some((o) => toClaudeRuntimeModelId(o.value) === 'env-model')).toBe(true);
    expect(options.some((o) => toClaudeRuntimeModelId(o.value) === 'internal-opus')).toBe(false);
  });
});
