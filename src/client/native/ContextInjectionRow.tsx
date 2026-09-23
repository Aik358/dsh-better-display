import { useState } from 'react'
import type { ContextMessageNode } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { DisclosureRow } from '@deepseek-ai/dsh-client-ui-primitives'
import { IconRead } from '../icons.js'
import { ReferenceIcon } from './ReferenceIcon.js'
import { contextBody } from './ContextBody.js'
import css from './ContextInjectionRow.module.css'

/**
 * The role/name projection this row reads, declared structurally on purpose.
 *
 * The field was renamed and its type moved with it between host generations:
 * the 0.1.7 line projects `producer: ContextProducerView`, the earlier line
 * projected `provenance: ContextProvenanceView`. Reading the shape the row
 * needs keeps one component rendering against either, including a bundle built
 * from types of a generation the running host has since replaced.
 */
interface ProducerView {
  role: 'inject' | 'recall'
  label: string | null
}

/** Props for the logged non-user message presentation. */
export interface ContextInjectionRowProps {
  content: ContextMessageNode['content']
  source: ContextMessageNode['source']
  /**
   * Role and producer name projected from the durable source.
   *
   * Host generations disagree on the field name: the 0.1.7 line projects
   * `producer`, the 0.1.6-alpha generations projected `provenance`. Both are
   * optional here and resolved below, so the row renders on either host instead
   * of throwing on `undefined.role` and degrading its whole block boundary.
   */
  producer?: ProducerView | null
  /** Alpha-generation spelling of {@link producer}. */
  provenance?: ProducerView | null
  /** Producer-declared information form; null renders the opaque body. */
  form: ContextMessageNode['form']
  /** The owning view's locale seat, passed down as a plain prop. */
  t: TranslateNS<'chat'>
}

/**
 * Render logged context with the Tool calls disclosure chrome from Figma.
 *
 * The header names the role the context plays and, beside it, the producer the
 * durable source identifies, so a reader can tell an injected skill catalog
 * from a workspace instruction file or a recalled session without expanding.
 * The expanded body follows the producer-declared form; an absent or unknown
 * form renders the opaque body.
 * @param props - Durable content, its projected producer role/name and form, and the locale seat.
 * @returns A collapsed context row with a bounded, form-specific body.
 */
export function ContextInjectionRow({ content, source, producer, provenance, form, t }: ContextInjectionRowProps) {
  const [open, setOpen] = useState(false)
  // Two host generations, one component. A row whose projection is absent
  // entirely still renders: the marker falls back to a plain injection.
  const view: ProducerView = producer ?? provenance ?? { role: 'inject', label: null }
  // Resolved rather than declared: a form whose fields are unreadable renders
  // the opaque body, and the marker must say what the row actually shows.
  const { rendered, summary, body } = contextBody(form, { content, source, t })

  return (
    <DisclosureRow
      className={css.root}
      icon={view.role === 'recall'
        ? <span data-context-recall-icon><ReferenceIcon kind="session" /></span>
        : <IconRead size={14} />}
      chevronClassName={css.chevron}
      title={t(view.role === 'recall' ? 'message.contextRecall' : 'message.contextInjection')}
      collapsedContent={view.label === null ? undefined : (
        /* ToolRow's separator shape: an aria-hidden dot, so the accessible name
           stays the two readable parts and the two disclosure rows expose one
           name shape. A source that names no producer drops the dot with it. */
        <>
          <span className={css.sep} aria-hidden />
          <span className={css.source} data-context-source>{view.label}</span>
          {summary !== null && (
            <>
              <span className={css.sep} aria-hidden />
              <span className={css.summary} data-context-summary>{summary}</span>
            </>
          )}
        </>
      )}
      keepContentWhenOpen
      open={open}
      expandable
      expandOnRowClick
      onToggle={() => { setOpen(value => !value) }}
    >
      <div className={css.body} data-context-injection-body data-context-form={rendered ?? undefined}>
        {body}
      </div>
    </DisclosureRow>
  )
}
