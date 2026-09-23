import type {
  DiffBlockLabels,
  JsonTreeLabels,
  MarkdownLabels,
  ReadBlockLabels,
  SearchBlockLabels,
  TerminalBlockLabels,
  WebBlockLabels,
} from '@deepseek-ai/dsh-client-ui-primitives';

/**
 * Label members the running host reads but the types installed in this checkout
 * do not declare yet, and one member the newer host dropped.
 *
 * The 0.1.7 line makes the code-card toolbar's language and wrap actions required
 * on `ReadBlockLabels` and `DiffBlockLabels`, and adds `noExitCode` to
 * `TerminalBlockLabels`; the 0.1.6 line declares `DiffBlockLabels.files` instead.
 * Each generation ignores what it does not read, so one extra-property-free
 * literal is produced by attaching the members after the typed object rather than
 * inside it.
 */
function withHostLabels<T>(labels: Partial<T>, extra: Record<string, unknown>): T {
  return Object.assign(labels, extra) as T;
}

/** Language and wrap actions for the shared code-card toolbar. */
const codeToolbar = { codeLabel: '代码', wrapLabel: '自动换行', unwrapLabel: '取消换行' };

export const markdownLabels: MarkdownLabels = {
  code: { copyLabel: '复制', copiedLabel: '已复制' },
  footnotes: '脚注',
};

export const readBlockLabels: ReadBlockLabels = withHostLabels<ReadBlockLabels>({
  window: (shown, total) => `显示 ${shown} / ${total} 行`,
  copy: '复制', copied: '已复制', collapseAria: '收起文件内容',
  expandAria: hidden => `展开其余 ${hidden} 行`, collapse: '收起', expand: hidden => `展开其余 ${hidden} 行`,
}, codeToolbar);

export const terminalBlockLabels: TerminalBlockLabels = withHostLabels<TerminalBlockLabels>({
  signal: signal => `信号 ${signal}`, exitCode: code => `退出码 ${code}`,
  running: '执行中', failed: '失败', done: '已完成', copy: '复制', copied: '已复制',
  noOutput: '没有输出', collapseAria: '收起命令输出', collapse: '收起',
  expandAria: hidden => `展开其余 ${hidden} 行`, expand: hidden => `展开其余 ${hidden} 行`,
}, { noExitCode: '未记录退出码' });

export const diffBlockLabels: DiffBlockLabels = withHostLabels<DiffBlockLabels>({
  copy: '复制', copied: '已复制', collapseAria: '收起差异', collapse: '收起',
  expandAria: hidden => `展开其余 ${hidden} 行`, expand: hidden => `展开其余 ${hidden} 行`,
}, { ...codeToolbar, files: (count: number) => `${count} 个文件` });

export const searchBlockLabels: SearchBlockLabels = {
  pathsSummary: (shown, total, truncated) => `${shown} / ${total} 个路径${truncated ? '（结果已截断）' : ''}`,
  matchesSummary: (shown, total, files, truncated) => `${shown} / ${total} 处匹配 · ${files} 个文件${truncated ? '（结果已截断）' : ''}`,
  copy: '复制', copied: '已复制', noResults: '没有结果', collapseAria: '收起搜索结果', collapse: '收起',
  expandAria: hidden => `展开其余 ${hidden} 行`, expand: hidden => `展开其余 ${hidden} 行`,
};

export const webBlockLabels: WebBlockLabels = {
  noResults: '没有结果', sourcesTruncated: '来源已截断', http: 'HTTP', contentTruncated: '内容已截断',
  markdown: markdownLabels,
};

export const jsonTreeLabels: JsonTreeLabels = {
  copyValue: '复制值', copyJson: '复制 JSON', copyPath: '复制路径', copyPrettyJson: '复制格式化 JSON',
  copyCompactJson: '复制紧凑 JSON', copied: '已复制', copyFailed: '复制失败', collapseNode: '收起节点',
  expandNode: '展开节点', copyButtonTitle: action => action,
};

export const truncatedJsonLabel = (total: number): string => `内容过长，已截断（共 ${total} 个字符）`;
