import {
  GENERATIVE_MCPAPPS_SKILL,
  skillListIncludes,
  skillsFromListResult,
  type HostSkillStatus,
} from '../skill-status.js';

export { GENERATIVE_MCPAPPS_SKILL, skillListIncludes, skillsFromListResult };
export type { HostSkillStatus };

export interface SkillStatusSnapshot {
  readonly name: typeof GENERATIVE_MCPAPPS_SKILL;
  readonly installed: boolean;
  readonly via: 'skills.list' | 'skill-root' | null;
  readonly roots: HostSkillStatus['roots'];
  readonly packPath?: string;
  readonly hostReached: boolean;
}

export interface SkillStatusProbe {
  listRemoteSkills?: () => Promise<readonly { readonly name?: string }[] | undefined>;
  fetchHostStatus?: () => Promise<HostSkillStatus | undefined>;
}

export async function detectGenerativeMcpappsSkill(probe: SkillStatusProbe): Promise<SkillStatusSnapshot> {
  let host: HostSkillStatus | undefined;
  if (probe.fetchHostStatus) {
    try {
      host = await probe.fetchHostStatus();
    } catch {
      host = undefined;
    }
  }

  let remoteHit = false;
  if (probe.listRemoteSkills) {
    try {
      remoteHit = skillListIncludes(await probe.listRemoteSkills());
    } catch {
      remoteHit = false;
    }
  }

  const installed = Boolean(host?.installed || remoteHit);
  const via = remoteHit ? 'skills.list' : (host?.via ?? null);
  return {
    name: GENERATIVE_MCPAPPS_SKILL,
    installed,
    via,
    roots: host?.roots ?? [],
    ...host?.packPath !== undefined ? { packPath: host.packPath } : {},
    hostReached: host !== undefined,
  };
}

export function shortestInstallCommand(status: Pick<SkillStatusSnapshot, 'packPath' | 'roots'>): string {
  const userRoot = status.roots.find(root => root.source === 'user-dsh')?.path
    ?? '$DSH_HOME/skills';
  const source = status.packPath ?? 'skills/generative-mcpapps';
  return `mkdir -p "${userRoot}" && cp -R "${source}" "${userRoot}/"`;
}

export function firstSessionId(list: { ids?: readonly string[]; byId?: Record<string, unknown> } | undefined): string | undefined {
  if (list?.ids && list.ids.length > 0) return list.ids[0];
  const keys = list?.byId ? Object.keys(list.byId) : [];
  return keys[0];
}
