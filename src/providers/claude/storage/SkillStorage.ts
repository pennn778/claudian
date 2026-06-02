import type { VaultFileAdapter } from '../../../core/storage/VaultFileAdapter';
import type { SlashCommand } from '../../../core/types';
import { parsedToSlashCommand, parseSlashCommandContent, serializeCommand } from '../../../utils/slashCommand';
import { getVaultClaudePath } from '../claudePaths';

export function getSkillsPath(): string {
  return getVaultClaudePath('skills');
}

/** @deprecated Use getSkillsPath() instead. Resolves the static default `.claude/skills`. */
export const SKILLS_PATH = '.claude/skills';

export class SkillStorage {
  constructor(private adapter: VaultFileAdapter) {}

  async loadAll(): Promise<SlashCommand[]> {
    const skills: SlashCommand[] = [];

    try {
      const skillsPath = getSkillsPath();
      const folders = await this.adapter.listFolders(skillsPath);

      for (const folder of folders) {
        const skillName = folder.split('/').pop()!;
        const skillPath = `${skillsPath}/${skillName}/SKILL.md`;

        try {
          if (!(await this.adapter.exists(skillPath))) continue;

          const content = await this.adapter.read(skillPath);
          const parsed = parseSlashCommandContent(content);

          skills.push({
            ...parsedToSlashCommand(parsed, {
              id: `skill-${skillName}`,
              name: skillName,
              source: 'user',
            }),
            kind: 'skill',
          });
        } catch {
          // Non-critical: skip malformed skill files
        }
      }
    } catch {
      return [];
    }

    return skills;
  }

  async save(skill: SlashCommand): Promise<void> {
    const name = skill.name;
    const dirPath = `${getSkillsPath()}/${name}`;
    const filePath = `${dirPath}/SKILL.md`;

    await this.adapter.ensureFolder(dirPath);
    await this.adapter.write(filePath, serializeCommand(skill));
  }

  async delete(skillId: string): Promise<void> {
    const name = skillId.replace(/^skill-/, '');
    const dirPath = `${getSkillsPath()}/${name}`;
    const filePath = `${dirPath}/SKILL.md`;
    await this.adapter.delete(filePath);
    await this.adapter.deleteFolder(dirPath);
  }
}
