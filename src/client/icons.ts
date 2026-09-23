/**
 * Product icons for the reader, resolved against whatever primitives build the
 * host actually serves.
 *
 * The reader imports no icon by name. A bundle external is answered by the
 * running host, and the icon exports were renamed between host generations:
 * the 0.1.6 line publishes `Icon<Glyph>Outline<px>` (`IconEditOutline16`), the
 * 0.1.7 line publishes weight-suffixed names with the size moved into a prop
 * (`IconEditOutlineRegular`). An external that lacks the imported key yields
 * `undefined`, and rendering an undefined component throws — which takes the
 * whole block boundary down with it ("此内容暂时无法在阅读页显示"), not just the
 * glyph. Translating the names once, here, keeps that class of host drift out
 * of every call site.
 *
 * Resolution order per glyph: current-generation name, previous-generation
 * name, then an inline fallback of comparable weight. Lookups happen on render
 * rather than at module load, so a resolved glyph always comes from the build
 * the host is actually serving.
 *
 * @module
 */
import { createElement, type ReactNode } from 'react'
import * as primitives from '@deepseek-ai/dsh-client-ui-primitives'

/** Props accepted by every icon in this module. */
export interface ReaderIconProps {
  /** Square edge in px; defaults to 16, matching the glyph set's drawn size. */
  size?: number | undefined
  /** Extra class for layout placement. */
  className?: string | undefined
}

type Artwork = (props: ReaderIconProps) => ReactNode

/** A drawing this module carries itself, keyed by the row it leads. */
type Owned = 'write' | 'read' | 'folder' | 'terminal' | 'search' | 'web' | 'skill' | 'other'

/** Told once per glyph, so a host that exports none of the candidates is diagnosable from the console alone. */
const reported = new Set<string>()

const exported = (name: string): Artwork | null => {
  const value = (primitives as Record<string, unknown>)[name]
  return typeof value === 'function' ? (value as Artwork) : null
}

/**
 * Resolve one glyph against the candidate export names, current generation first.
 * @param names - Candidate export names, most-preferred first.
 * @param owned - This module's own drawing, used when the host exports none of them.
 * @returns A component accepting {@link ReaderIconProps}.
 */
function artworkOf(names: readonly string[], owned: Owned): Artwork {
  return ({ size = 16, className }: ReaderIconProps): ReactNode => {
    for (const name of names) {
      const found = exported(name)
      if (found) return found({ size, className })
    }
    if (!reported.has(names[0]!)) {
      reported.add(names[0]!)
      console.warn('[dsh-better-display] host build exports no icon for', names.join(' / '), '- using the bundled glyph')
    }
    return createElement('svg', {
      width: size,
      height: size,
      className,
      viewBox: '0 0 16 16',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.45,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': true,
      xmlns: 'http://www.w3.org/2000/svg',
    }, createElement('path', { d: OWNED[owned] }))
  }
}

/**
 * Contours for the bundled drawings, at the same 16-unit grid and 1.45px stroke
 * as the host's own regular-weight set. They are the last resort: a host that
 * exports either candidate renders its own artwork instead.
 */
const OWNED: Record<Owned, string> = {
  write: 'M11.2 1.9l2.9 2.9-8.3 8.3-3.4.5.5-3.4 8.3-8.3ZM10.1 3l2.9 2.9',
  read: 'M8 3.4C6.6 2.3 4.7 1.8 2.4 1.8h-1v12.4h1c2.3 0 4.2.5 5.6 1.6 1.4-1.1 3.3-1.6 5.6-1.6h1V1.8h-1c-2.3 0-4.2.5-5.6 1.6ZM8 3.4v12.4',
  folder: 'M1.4 3.7h4.2l1.6 1.8h7.4v7.6H1.4V3.7Z',
  terminal: 'M2.1 3.6l4.1 4.4-4.1 4.4M8.6 12.4h5.3',
  search: 'M11.1 10.2l2.9 2.9M12 7.1a4.9 4.9 0 1 1-9.8 0 4.9 4.9 0 0 1 9.8 0Z',
  web: 'M14.4 8a6.4 6.4 0 1 1-12.8 0 6.4 6.4 0 0 1 12.8 0ZM1.6 8h12.8M8 1.6c1.9 2 2.8 4.1 2.8 6.4S9.9 12.4 8 14.4C6.1 12.4 5.2 10.3 5.2 8S6.1 3.6 8 1.6Z',
  skill: 'M5.6 1.6h5l2.9 2.9v10h-7.9V1.6ZM10.5 1.6v3h3M7.4 8.5h3.9M7.4 11.1h3.9',
  other: 'M6.2 3.4c.3 2.4 1.4 3.5 3.8 3.8-2.4.3-3.5 1.4-3.8 3.8-.3-2.4-1.4-3.5-3.8-3.8 2.4-.3 3.5-1.4 3.8-3.8ZM12.3 1.6c.13 1 .62 1.5 1.62 1.62-1 .13-1.5.63-1.62 1.63-.13-1-.62-1.5-1.62-1.63 1-.12 1.5-.62 1.62-1.62ZM12.3 9.9c.13 1 .62 1.5 1.62 1.62-1 .13-1.5.63-1.62 1.63-.13-1-.62-1.5-1.62-1.63 1-.12 1.5-.62 1.62-1.62Z',
}

/** Leading glyph of a write or edit tool row. */
export const IconWrite = artworkOf(['IconEditOutlineRegular', 'IconEditOutline16'], 'write')
/** Leading glyph of a read tool row. */
export const IconRead = artworkOf(['IconBrowseOutlineRegular', 'IconBrowseOutline16'], 'read')
/** Closed folder, for inline folder references. */
export const IconFolder = artworkOf(['IconFolderCloseRegular', 'IconFolderClose16'], 'folder')
/** Leading glyph of a terminal or code-interpreter tool row. */
export const IconTerminal = artworkOf(['IconApiOutlineRegular', 'IconApiOutline14', 'IconCodeOutlineRegular', 'IconCodeOutline16'], 'terminal')
/** Leading glyph of a search tool row. */
export const IconSearch = artworkOf(['IconSearchOutlineRegular', 'IconSearchOutline16'], 'search')
/** Leading glyph of a web tool row. */
export const IconWeb = artworkOf(['IconGlobeOutlineRegular', 'IconGlobeOutline16', 'IconSearchOutlineRegular', 'IconSearchOutline16'], 'web')
/** Leading glyph of a skill tool row. */
export const IconSkill = artworkOf(['IconSkillOutlineRegular', 'IconSkillOutline16'], 'skill')
/** Leading glyph of any other tool row. */
export const IconOther = artworkOf(['IconSparkleRegular', 'IconSparkle16'], 'other')
