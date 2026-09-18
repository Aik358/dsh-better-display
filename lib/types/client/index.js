import { resolveWorkspacePath } from '@deepseek-ai/dsh-util-workspace-path';
import * as workspacePathPkg from '@deepseek-ai/dsh-util-workspace-path';
import { dirname } from './deliverables.js';
import { Reader } from './Reader.js';
import { createReaderStore } from './store.js';
import { installReaderEntry } from './entry.js';
import { installBetterDisplaySettings } from './settings.js';
import { fillComposerDom } from './mcp-app.js';
import { fileAddressFor, modeFromSnapshot, openDeliverableFile } from './open-file.js';
const officialFileAddressFor = workspacePathPkg.fileAddressFor;
async function openWorkspacePath(ctx, path) {
    const remote = ctx.remote;
    const remoteSession = remote?.session
        ?? ctx.get?.('remote.session')
        ?? (ctx.get?.('remote')?.session);
    if (remoteSession?.openWorkspacePath) {
        const result = await remoteSession.openWorkspacePath({ path });
        if (!result?.ok) {
            console.warn('[dsh-better-display] openWorkspacePath failed:', result?.error?.message);
        }
    }
    else {
        console.warn('[dsh-better-display] remote.session is not available');
    }
}
export { McpAppFrame } from './McpAppFrame.js';
export const name = 'dsh-better-display-client';
export const inject = ['slots', 'sessions', 'conversation', 'remote', 'remote.session'];
export function apply(ctx) {
    const store = createReaderStore();
    // conversation.view is session-scoped, so session persist keys are
    // `dsh.reader.v1.<sessionId>`. One root instance keeps glass, fold
    // intensity, and open-mode on the unsuffixed `dsh.reader.v1` key.
    const prefs = store.create();
    installBetterDisplaySettings(ctx, prefs);
    ctx.slots.inject('conversation.view', function* () {
        yield ctx.slots.register({
            name: 'conversation.view',
            id: 'reader',
            order: -5,
            label: () => '阅读',
            locale: 'chat',
            children: { 'dsh-better-display.block': { kind: 'chain', scope: 'session' } },
            store,
            inject: (sessionId) => {
                const session = () => {
                    const current = ctx.sessions.binding(sessionId)?.session;
                    if (!current)
                        throw new Error('阅读页对应的会话已关闭。');
                    return current;
                };
                return {
                    openPrefs: prefs,
                    loadOlder: async () => { await session().loadOlder(); },
                    loadImage: async (attachment) => {
                        const receipt = await session().readAttachment(attachment.attachmentId);
                        if (!receipt.ok)
                            throw new Error(receipt.error.message);
                        return { data: Uint8Array.from(receipt.value.data), mediaType: receipt.value.attachment.mediaType };
                    },
                    openFile: async (path) => {
                        try {
                            const cwd = ctx.sessions?.list?.getSnapshot?.()?.byId[sessionId]?.cwd;
                            const sidebar = (ctx.get?.('sidebarRight')
                                ?? ctx.sidebarRight);
                            await openDeliverableFile({
                                path,
                                mode: modeFromSnapshot(prefs),
                                sessionId,
                                cwd,
                                resolveWorkspacePath,
                                openExternal: async (absolutePath) => { await openWorkspacePath(ctx, absolutePath); },
                                openSidebar: typeof sidebar?.openResource === 'function'
                                    ? (address) => { sidebar.openResource(address); }
                                    : undefined,
                                fileAddressFor: officialFileAddressFor ?? fileAddressFor,
                                warn: (message, extra) => { console.warn(message, extra); },
                            });
                        }
                        catch (error) {
                            console.warn('[dsh-better-display] openFile error:', error);
                        }
                    },
                    revealFile: async (path) => {
                        try {
                            const cwd = ctx.sessions?.list?.getSnapshot?.()?.byId[sessionId]?.cwd;
                            const targetPath = resolveWorkspacePath(cwd, path);
                            // 1. Try dedicated host endpoint for native file highlighting (open -R / explorer /select)
                            try {
                                const res = await fetch('/better-display/reveal', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ path: targetPath }),
                                });
                                if (res.ok) {
                                    const data = await res.json();
                                    if (data.ok)
                                        return;
                                }
                            }
                            catch {
                                // Server endpoint not yet available, fallback to directory open
                            }
                            // 2. Fallback to official opener with parent directory
                            const parentDir = dirname(targetPath);
                            const remote = ctx.remote;
                            const remoteSession = remote?.session
                                ?? ctx.get?.('remote.session');
                            if (remoteSession?.openWorkspacePath) {
                                await remoteSession.openWorkspacePath({ path: parentDir });
                            }
                        }
                        catch (error) {
                            console.warn('[dsh-better-display] revealFile error:', error);
                        }
                    },
                    forkAt: (seq) => {
                        // A missing anchor would silently fork the whole session instead of
                        // the intended turn prefix, so refuse it loudly rather than guessing.
                        if (typeof seq !== 'number' || !Number.isFinite(seq)) {
                            console.warn('[dsh-better-display] fork refused: missing anchor seq');
                            return;
                        }
                        try {
                            const sessionsApi = ctx.sessions;
                            if (sessionsApi?.fork) {
                                sessionsApi.fork({ sessionId, atSeq: seq, increaseTitle: true })
                                    .then(childId => { sessionsApi.open?.(childId); })
                                    .catch(err => { console.warn('[dsh-better-display] fork failed:', err); });
                            }
                        }
                        catch (error) {
                            console.warn('[dsh-better-display] forkAt error:', error);
                        }
                    },
                    loadThrough: async (seq) => {
                        try {
                            const current = session();
                            if (typeof current?.loadThrough === 'function') {
                                await current.loadThrough(seq);
                            }
                            else {
                                await session().loadOlder();
                            }
                        }
                        catch (error) {
                            console.warn('[dsh-better-display] loadThrough error:', error);
                        }
                    },
                    fillComposer: (text) => {
                        // Sanctioned path: the conversation input shell owns the Lexical
                        // editor, so setDraft lands in the draft store deterministically.
                        try {
                            const conversation = ctx.conversation;
                            const shell = conversation?.input?.shell?.(sessionId);
                            if (shell && typeof shell.setDraft === 'function') {
                                shell.setDraft(text);
                                return true;
                            }
                        }
                        catch {
                            // Fall through to the DOM path below.
                        }
                        try {
                            return fillComposerDom(text);
                        }
                        catch {
                            return false;
                        }
                    },
                    getToolView: (toolName) => {
                        try {
                            const slotsService = ctx.slots;
                            const entries = slotsService?.entriesOfSlot?.('tool.call.toolview') ?? [];
                            const matches = entries.filter((e) => {
                                const key = e?.options?.key ?? e?.key;
                                const comp = e?.component ?? e?.view ?? e?.render ?? (typeof e === 'function' ? e : null);
                                return key === toolName && typeof comp === 'function';
                            });
                            if (matches.length === 0)
                                return null;
                            matches.sort((a, b) => {
                                const prioA = a?.options?.priority ?? a?.priority ?? 0;
                                const prioB = b?.options?.priority ?? b?.priority ?? 0;
                                return prioA - prioB;
                            });
                            const best = matches[0];
                            const prio = best?.options?.priority ?? best?.priority ?? 0;
                            const comp = best?.component ?? best?.view ?? best?.render ?? (typeof best === 'function' ? best : null);
                            if (prio < 0 || (toolName !== 'edit' && toolName !== 'write')) {
                                return comp;
                            }
                            return null;
                        }
                        catch {
                            return null;
                        }
                    },
                };
            },
        }, Reader);
        yield installReaderEntry(ctx);
    });
}
//# sourceMappingURL=index.js.map