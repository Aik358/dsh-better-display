import assert from 'node:assert/strict';
import test from 'node:test';
import { keepProseOf } from '../src/client/fold-intensity.js';
import { presentLiveTurn, splitChainKeepingBody, type LiveStep } from '../src/client/live-turn.js';

/** Minimal step factories: only the fields the splitter reads. */
const reasoning = (n: number): LiveStep => ({ kind: 'reasoning', key: `r${n}`, nodeKey: 'a', start: n, blocks: [], step: 0 });
const body = (n: number): LiveStep => ({ kind: 'body', key: `b${n}`, nodeKey: 'a', start: n, blocks: [], step: 0 });
const tool = (n: number): LiveStep => ({ kind: 'tool', key: `t${n}`, entry: { callId: `c${n}` } as never });
const other = (n: number): LiveStep => ({ kind: 'other', key: `o${n}`, nodeKey: 'a' });

const openBoundary = { status: 'open' } as never;

test('keepProseOf defaults to off and reads only an explicit true', () => {
  assert.equal(keepProseOf(undefined), false);
  assert.equal(keepProseOf({}), false);
  assert.equal(keepProseOf({ keepProse: false }), false);
  assert.equal(keepProseOf({ keepProse: 'yes' }), false);
  assert.equal(keepProseOf({ keepProse: true }), true);
});

test('splitChainKeepingBody folds process runs and never a body step', () => {
  const segments = splitChainKeepingBody([reasoning(0), tool(1), body(2), reasoning(3), tool(4)]);
  assert.deepEqual(segments.map(s => ({ fold: s.fold?.map(x => x.key) ?? null, open: s.open.map(x => x.key) })), [
    { fold: ['r0', 't1'], open: [] },
    { fold: null, open: ['b2'] },
    { fold: null, open: ['r3', 't4'] },
  ]);
});

test('splitChainKeepingBody leaves the trailing run open', () => {
  // The last run is still streaming, so it must stay readable as it arrives.
  const segments = splitChainKeepingBody([body(0), reasoning(1), tool(2), tool(3)]);
  assert.deepEqual(segments.map(s => s.fold?.length ?? 0), [0, 0]);
  assert.deepEqual(segments[1]!.open.map(s => s.key), ['r1', 't2', 't3']);
});

test('splitChainKeepingBody keeps a single-step run so a lone tool row keeps its name', () => {
  const segments = splitChainKeepingBody([tool(0), body(1)]);
  assert.equal(segments[0]!.fold, null);
  assert.deepEqual(segments[0]!.open.map(s => s.key), ['t0']);
});

test('splitChainKeepingBody treats non-body process kinds as foldable', () => {
  const segments = splitChainKeepingBody([reasoning(0), other(1), body(2)]);
  assert.deepEqual(segments[0]!.fold?.map(s => s.key), ['r0', 'o1']);
});

test('presentLiveTurn keepProse folds process but leaves every body step open', () => {
  const steps = [reasoning(0), tool(1), body(2), body(3), reasoning(4), tool(5), body(6)];
  const items = presentLiveTurn(steps, openBoundary, true, true);
  const kinds = items.map(i => (i.kind === 'open' ? `open:${i.step.key}` : `fold:${i.summary}`));
  assert.deepEqual(kinds, ['fold:思考×1 · 工具×1', 'open:b2', 'open:b3', 'fold:思考×1 · 工具×1', 'open:b6']);
});

test('presentLiveTurn without keepProse keeps the existing fold shape', () => {
  // Legacy splitChain folds everything before the LAST reasoning step, so the
  // reasoning step must not be first for a fold to happen at all.
  const steps = [body(0), tool(1), reasoning(2)];
  const items = presentLiveTurn(steps, openBoundary, true, false);
  assert.equal(items[0]!.kind, 'fold');
  assert.deepEqual(items[0]!.kind === 'fold' ? items[0]!.steps.map(s => s.key) : [], ['b0', 't1']);
  assert.equal(items.filter(i => i.kind === 'open' && i.step.kind === 'body').length, 0);
});

test('presentLiveTurn keepProse is inert when auto-fold is off', () => {
  const steps = [reasoning(0), tool(1), body(2)];
  const items = presentLiveTurn(steps, openBoundary, false, true);
  assert.equal(items.every(i => i.kind === 'open'), true);
});
