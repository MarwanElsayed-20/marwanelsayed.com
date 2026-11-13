# Design tokens

All tokens live in `src/styles/tokens.css` inside one `@theme static` block. Colors appear only there. Values form the editorial system and may be revised without changing their names.

## Groups and names

| Group       | Prefix                                                                  | Tailwind utilities                                                                                                            | Names                                                                                                                                                                                                                                                                              |
| ----------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Color       | `--color-*`                                                             | `bg-*`, `text-*`, `border-*`, `outline-*`                                                                                     | background, surface, surface-subtle, foreground, muted, accent, accent-strong, border, border-strong, focus, disabled, highlight, and the Selected work scene colours `scene-<project>-bg`, `-ink`, `-muted`, `-accent` (toolswift, smooth-erp, aligna, wajihni) plus `scene-wash` |
| Font family | `--font-*`                                                              | `font-sans`, `font-serif`                                                                                                     | sans and serif (both Inter Tight)                                                                                                                                                                                                                                                  |
| Type scale  | `--text-*`, with `--line-height` and `--letter-spacing` companions      | `text-mega`, `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-h4`, `text-lead`, `text-body`, `text-small`, `text-label` | display, h1, h2, h3, h4, lead, body, small, label                                                                                                                                                                                                                                  |
| Spacing     | `--spacing`, `--spacing-section`, `--spacing-gutter`, `--spacing-stack` | numbered spacing steps, `py-section`, `px-gutter`, `gap-stack`                                                                | base (0.25rem), section, gutter, stack                                                                                                                                                                                                                                             |
| Widths      | `--container-*`                                                         | `max-w-reading`, `max-w-page`, `max-w-wide`                                                                                   | reading (fluid 40 to 62rem), page (200rem, effectively full width), wide (200rem)                                                                                                                                                                                                  |
| Radius      | `--radius-*`                                                            | `rounded-sm`, `rounded-md`, `rounded-lg`                                                                                      | sm, md, lg                                                                                                                                                                                                                                                                         |
| Motion      | `--duration-*`, `--ease-standard`                                       | `duration-(--duration-fast)`, `duration-(--duration-base)`, `ease-standard`                                                   | fast (150ms), base (250ms), standard                                                                                                                                                                                                                                               |

Type sizes and section padding are fluid. The page gutter adapts to the viewport, and the 0.25rem spacing base supplies numbered rhythm steps. Grid uses one column below 768px, two from 768px, and three from 1024px when requested. Hairline borders are 1px; emphasis and focus outlines are 2px with a 2px focus offset.

## Typefaces

Inter Tight, a tight neo-grotesque, is the only typeface: light and bold weights carry the hierarchy, and `font-serif` is an alias of `font-sans`. It uses SIL OFL 1.1 and is self-hosted from `src/fonts/` through `src/app/fonts.ts` as one Latin-subset variable WOFF2 (weights 100 to 900). Downloadable faces use `font-display: swap`. Local fallback metrics live in `src/styles/font-fallbacks.css` (Arial on Windows and macOS, DejaVu Sans on Linux). Recheck fallback metrics and browser line wrapping when replacing the font file. Text stays readable when the download fails; no fallback font download is added. `inter-roman.woff2` stays in the repository only for the illustration and capture generator (see docs/illustrations.md); the site does not load it.

## Contrast

| Foreground              | Background          | Ratio | Minimum | Use                                           |
| ----------------------- | ------------------- | ----- | ------- | --------------------------------------------- |
| foreground              | background          | 16.11 | 4.5     | Body text on page                             |
| foreground              | surface             | 18.41 | 4.5     | Text on cards                                 |
| foreground              | surface-subtle      | 14.40 | 4.5     | Text on tinted bands                          |
| background              | foreground          | 16.11 | 4.5     | Text on the menu overlay                      |
| muted                   | background          | 6.13  | 4.5     | Secondary text on page                        |
| muted                   | surface             | 7.00  | 4.5     | Secondary text on cards                       |
| muted                   | surface-subtle      | 5.48  | 4.5     | Labels and footer text                        |
| accent                  | background          | 13.79 | 4.5     | Links on page                                 |
| accent                  | surface             | 15.76 | 4.5     | Links on cards                                |
| accent                  | surface-subtle      | 12.32 | 4.5     | Accent labels                                 |
| surface                 | accent              | 15.76 | 4.5     | Primary button text                           |
| surface                 | accent-strong       | 10.61 | 4.5     | Primary button hover and pressed              |
| accent-strong           | background          | 9.29  | 4.5     | Link hover on page                            |
| accent-strong           | surface-subtle      | 8.30  | 4.5     | Link hover on tinted bands                    |
| border-strong           | background          | 3.45  | 3       | Control outline on page                       |
| border-strong           | surface             | 3.94  | 3       | Control outline on cards                      |
| border-strong           | surface-subtle      | 3.08  | 3       | Control outline on tinted bands               |
| focus                   | background          | 7.27  | 3       | Focus ring on page                            |
| focus                   | surface             | 8.31  | 3       | Focus ring on cards                           |
| focus                   | surface-subtle      | 6.50  | 3       | Focus ring on tinted bands                    |
| disabled                | background          | 3.73  | 3       | Disabled text on page (exempt, still checked) |
| disabled                | surface-subtle      | 3.33  | 3       | Disabled button text (exempt, still checked)  |
| scene-toolswift-ink     | scene-toolswift-bg  | 16.01 | 4.5     | Title and text, toolswift                     |
| scene-toolswift-muted   | scene-toolswift-bg  | 8.24  | 4.5     | Summary and tabs, toolswift                   |
| scene-toolswift-accent  | scene-toolswift-bg  | 9.87  | 4.5     | Label and links, toolswift                    |
| scene-smooth-erp-ink    | scene-smooth-erp-bg | 13.19 | 4.5     | Title and text, smooth-erp                    |
| scene-smooth-erp-muted  | scene-smooth-erp-bg | 6.42  | 4.5     | Summary and tabs, smooth-erp                  |
| scene-smooth-erp-accent | scene-smooth-erp-bg | 5.21  | 4.5     | Label and links, smooth-erp                   |
| scene-aligna-ink        | scene-aligna-bg     | 14.16 | 4.5     | Title and text, aligna                        |
| scene-aligna-muted      | scene-aligna-bg     | 6.37  | 4.5     | Summary and tabs, aligna                      |
| scene-aligna-accent     | scene-aligna-bg     | 4.57  | 4.5     | Label and links, aligna                       |
| scene-wajihni-ink       | scene-wajihni-bg    | 15.76 | 4.5     | Title and text, wajihni                       |
| scene-wajihni-muted     | scene-wajihni-bg    | 7.75  | 4.5     | Summary and tabs, wajihni                     |
| scene-wajihni-accent    | scene-wajihni-bg    | 5.93  | 4.5     | Label and links, wajihni                      |

Each Selected work scene is its own surface: its text uses only that scene's ink, muted and accent tokens, on that scene's background. `scene-wash` carries no text; it only tints the panel for a moment between two scenes.

The decorative `border` token (about 1.4:1) is used only for dividers that carry no information; control boundaries use `border-strong`. If you change a color value, update this table. `src/styles/tokens.test.ts` verifies minimum contrast, and `src/styles/design-tokens-docs.test.ts` verifies that the table matches the computed ratios.

## How to change a token

Edit its value in `tokens.css`, run `pnpm test`, update the contrast table if needed, and view `/design-system` with `pnpm dev`. Review responsive, keyboard, forced-colors, and reduced-motion behavior before accepting the change.

## How to add a token

Add it inside the existing `@theme static` block using the correct prefix. Never hard-code its value elsewhere. For a color used by text or control boundaries, add every pairing to `src/lib/contrast.ts` and document it here. Run `pnpm check`.

## Rules

- No color literals outside `tokens.css`; a source test enforces this.
- Text pairs need at least 4.5:1; large text and control boundaries need at least 3:1. Disabled controls are exempt, but their contrast is still checked.
- Use rem-based sizes so user font settings scale the design.
- Use only the duration and easing tokens for motion. Global reduced-motion rules disable animation and transitions without hiding content.
- Keep the light theme. Focus uses an outline that remains visible in forced-colors mode.
