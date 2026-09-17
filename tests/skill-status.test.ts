import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  GENERATIVE_MCPAPPS_SKILL,
  skillListIncludes,
  skillNameMatches,
  skillRootEntryMatches,
  skillsFromListResult,
} from '../src/skill-status.ts';
import {
  projectSkillRoots,
  rootHasGenerativeMcpapps,
  scanGenerativeMcpappsStatus,
  userSkillRoots,
} from '../src/skill-roots.ts';
import { detectGenerativeMcpappsSkill, firstSessionId, shortestInstallCommand } from '../src/client/skill-status.ts';

test('only the kebab-case skill name counts as installed', () => {
  assert.equal(skillNameMatches(GENERATIVE_MCPAPPS_SKILL), true);
  assert.equal(skillNameMatches('other'), false);
  assert.equal(skillRootEntryMatches('generative-mcpapps'), true);
  assert.equal(skillRootEntryMatches('generative-mcpapps.md'), true);
  assert.equal(skillRootEntryMatches('skills'), false);
  assert.equal(skillListIncludes([{ name: 'generative-mcpapps' }]), true);
  assert.equal(skillListIncludes(skillsFromListResult({ ok: true, value: { skills: [{ name: 'generative-mcpapps' }] } })), true);
});

test('plugin-tree skills/ is not a harness skill root', () => {
  const roots = [
    ...projectSkillRoots('/plugin/dsh-better-display'),
    ...userSkillRoots({ DSH_HOME: '/home/me/.dsh', DSH_AGENTS_HOME: '/home/me/.agents' }, '/home/me'),
  ];
  assert.deepEqual(roots.map(root => root.path), [
    '/plugin/dsh-better-display/.dsh/skills',
    '/plugin/dsh-better-display/.agents/skills',
    '/home/me/.dsh/skills',
    '/home/me/.agents/skills',
  ]);
  assert.equal(roots.some(root => root.path.endsWith('/dsh-better-display/skills')), false);
});

test('a real user skill root with the pack is installed; the plugin pack path is not', async () => {
  const emptyHome = await mkdtemp(join(tmpdir(), 'dsh-bd-empty-'));
  const skillHome = await mkdtemp(join(tmpdir(), 'dsh-bd-skill-'));
  const userRoot = join(skillHome, '.dsh', 'skills', 'generative-mcpapps');
  await mkdir(userRoot, { recursive: true });
  await writeFile(join(userRoot, 'SKILL.md'), '---\nname: generative-mcpapps\ndescription: x\n---\n');

  const missing = await scanGenerativeMcpappsStatus({
    home: emptyHome,
    env: {},
    packPath: '/plugin/dsh-better-display/skills/generative-mcpapps',
  });
  const found = await scanGenerativeMcpappsStatus({
    home: skillHome,
    env: { DSH_HOME: join(skillHome, '.dsh') },
    packPath: '/plugin/dsh-better-display/skills/generative-mcpapps',
  });

  assert.equal(await rootHasGenerativeMcpapps('/plugin/dsh-better-display/skills'), false);
  assert.equal(missing.installed, false);
  assert.equal(found.installed, true);
  assert.equal(found.via, 'skill-root');
  assert.equal(found.packPath, '/plugin/dsh-better-display/skills/generative-mcpapps');
});

test('skills/list wins when the registry can see the skill', async () => {
  const status = await detectGenerativeMcpappsSkill({
    fetchHostStatus: async () => ({
      name: 'generative-mcpapps',
      installed: false,
      via: null,
      roots: [{ source: 'user-dsh', path: '/tmp/.dsh/skills', present: false }],
    }),
    listRemoteSkills: async () => [{ name: 'generative-mcpapps' }],
  });
  assert.equal(status.installed, true);
  assert.equal(status.via, 'skills.list');
});

test('install command copies into a user skill root', () => {
  const command = shortestInstallCommand({
    packPath: '/opt/plugin/skills/generative-mcpapps',
    roots: [{ source: 'user-dsh', path: '/home/me/.dsh/skills' }],
  });
  assert.match(command, /mkdir -p "\/home\/me\/\.dsh\/skills"/);
  assert.match(command, /cp -R "\/opt\/plugin\/skills\/generative-mcpapps"/);
});

test('firstSessionId reads ids or byId keys', () => {
  assert.equal(firstSessionId({ ids: ['a', 'b'] }), 'a');
  assert.equal(firstSessionId({ byId: { z: {} } }), 'z');
  assert.equal(firstSessionId(undefined), undefined);
});
