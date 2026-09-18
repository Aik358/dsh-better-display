export type SettingsCopyKey =
  | 'nav'
  | 'openTitle'
  | 'openDescription'
  | 'glassTitle'
  | 'glassDescription'
  | 'foldTitle'
  | 'foldDescription'
  | 'foldNone'
  | 'foldStandard'
  | 'foldSummary'
  | 'skillTitle'
  | 'skillInstalled'
  | 'skillMissing'
  | 'skillPurpose'
  | 'skillPluginNote'
  | 'skillInstall'
  | 'skillRecheck'
  | 'skillChecking'
  | 'skillUnavailable';

export type SettingsCopy = Record<SettingsCopyKey, string>;

export const en: SettingsCopy = {
  nav: 'Better Display',
  openTitle: 'Open deliverables in built-in panel',
  openDescription: 'Off by default: chips and inline file mentions open in the system app. Turn this on to preview them in the right Sidebar, matching official chat. Reveal and folder actions still use the system file manager.',
  glassTitle: 'Translucent frosted glass',
  glassDescription: 'Off by default: reading chrome stays opaque, matching the current Host look. Turn this on to let wallpaper and skins show through the panel; path and count chips stay clear until hover or focus.',
  foldTitle: 'Process fold intensity',
  foldDescription: 'Default is Standard fold: a later thought collapses earlier steps, same as current main. None keeps every step open. Process summary collapses finished thinking and tools to one-line actions; the body never folds.',
  foldNone: 'No fold',
  foldStandard: 'Standard fold',
  foldSummary: 'Process summary',
  skillTitle: 'generative-mcpapps skill',
  skillInstalled: 'Installed',
  skillMissing: 'Not detected',
  skillPurpose: 'This install is for model auto-selection of MCP Apps. Reader already renders mcp-app fences when the model emits them.',
  skillPluginNote: 'Shipping the pack inside this plugin repository does not install it into the harness skill catalog.',
  skillInstall: 'Copy the whole generative-mcpapps folder (including references and examples) into .dsh/skills or .agents/skills — in your home or the project, you choose — then Re-check. There is no one-click install that works on every host.',
  skillRecheck: 'Re-check',
  skillChecking: 'Checking…',
  skillUnavailable: 'Could not query the host skill catalog. Copy into .dsh/skills or .agents/skills (home or project), then Re-check.',
};

export const zh: SettingsCopy = {
  nav: 'Better Display',
  openTitle: '在内置面板中打开产物',
  openDescription: '默认关闭：产物芯片和正文中的文件提及会用系统应用打开。打开后与官方对话一致，在右侧栏预览。访达 / 资源管理器中的显示与打开所在文件夹不受此开关控制。',
  glassTitle: '半透明毛玻璃',
  glassDescription: '默认关闭：阅读栏保持不透明，和现在的 Host 观感一致。打开后透出宿主壁纸与皮肤；路径、行数等标签静止时透明，悬停或聚焦才显出轮廓。',
  foldTitle: '过程折叠强度',
  foldDescription: '默认「标准折叠」：新思考出现时收起此前步骤，和当前主线一致。「不折叠」全程展开。「过程摘要」把已结束的思考和工具收成一行动作，正文永不折叠。',
  foldNone: '不折叠',
  foldStandard: '标准折叠',
  foldSummary: '过程摘要',
  skillTitle: 'generative-mcpapps 技能',
  skillInstalled: '已安装',
  skillMissing: '未检测到',
  skillPurpose: '这项安装是为了让模型自动选用 MCP Apps。阅读页在模型写出 mcp-app 代码块时已经会渲染，不依赖该技能是否装进宿主。',
  skillPluginNote: '技能包只出现在本插件仓库里，并不等于当前 Agent 已经加载它。',
  skillInstall: '把完整的 generative-mcpapps 文件夹（含 references 与 examples）复制到 .dsh/skills 或 .agents/skills（家目录或项目目录，由你选），然后重新检测。没有在所有宿主上都可用的一键安装。',
  skillRecheck: '重新检测',
  skillChecking: '正在检测…',
  skillUnavailable: '无法查询宿主技能目录。请复制到 .dsh/skills 或 .agents/skills（家目录或项目），再重新检测。',
};

export function settingsLanguage(tag: string | undefined): 'zh' | 'en' {
  return (tag ?? '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export function settingsCopyFor(tag: string | undefined): SettingsCopy {
  return settingsLanguage(tag) === 'zh' ? zh : en;
}
