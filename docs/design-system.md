# Design System Reference

This app's visual language was reverse-engineered from [misfitsmarket.com](https://www.misfitsmarket.com) and translated into this project's own tokens — no text, images, logos, or trademarks were copied, only structural design rules (colors, type scale, spacing, component patterns).

## How this was extracted

**Tool/method:** No packaged "design-system extractor" (e.g. SkillUI) or headless browser was available in this environment. Instead, the reference site's actual build artifacts were pulled and statically analyzed:
- `curl` fetched the live HTML (`https://www.misfitsmarket.com`) and its compiled CSS bundle (`/_next/static/css/*.css`, a Next.js/Tailwind production build).
- Pattern extraction (`grep`/regex) over that CSS pulled out custom properties, class definitions, `@font-face` rules, `@media` breakpoints, and named utility classes (Tailwind preserves semantic class names like `.text-heading-lg`, `.button-primary`, `.bg-bone` even after purging).
- Sample HTML elements (buttons, links, nav) were inspected for real class combinations to confirm component patterns.

**Limitation:** this is static CSS/DOM analysis, not rendered/computed-style inspection — there was no headless browser (Playwright/Puppeteer were unavailable and not installable in this sandbox) to screenshot the live page or read computed styles. Everything below was confirmed directly in source; nothing was guessed from a screenshot.

## Extracted tokens (source of truth) → applied tokens (this app)

### Color

| Role | Misfits source value | Applied token | Applied value |
|---|---|---|---|
| Page background (cream) | `#f2ebd1` ("bone") | `--color-cream` | `#f2ebd1` |
| Card/surface background | `#fff9ea` ("malt") | `--color-pale` | `#fff9ea` |
| Primary text (ink) | `#2d2d2d` | `--color-ink` | `#2a2a27` |
| Secondary/muted text | `#666666` | `--color-muted` | `#5c5c54` |
| Border, default | `#c3c3c3` ("grey-light") | `--color-border` | `#ddd2b6` |
| Border, subtle | `#f2f2f2` ("grey-extra-light") | `--color-border-soft` | `#ece4d1` |
| Brand/interactive green | `#2e8540` ("kale") | `--color-sprout-600` | `#2e7d43` |
| Brand green, dark (headers) | *(inferred, darker step)* | `--color-sprout-900` | `#1c3222` |
| Brand green, hover | *(inferred, darker step)* | `--color-sprout-700` | `#20612f` |
| CTA accent (yellow) | `#f1c34a` (button-primary bg) | `--color-honey` | `#f1c34a` |
| Secondary accent (magenta) | `#b32274` | `--color-berry` | `#b32274` |
| Error | `#d9291f` | `--color-error` | `#d9291f` |
| Warning/low-stock | *(inferred, warm)* | `--color-warning` | `#b36729` |

The exact hex numbers are generic color data (not a logo, wordmark, or protected asset), so they're reused directly; token *names* and the overall palette *assembly* are this project's own, and several roles (dark green, hover states, warning) were inferred since Misfits doesn't expose every shade this app needs.

### Typography

Misfits uses two custom, commercially-licensed fonts (`Grotesk`, `Lufga Bold`) served from their own font files — those can't be legally pulled into this project. The **shape of the system** (one geometric-grotesque sans for everything, bold weight carrying all hierarchy, no serif) was translated using an open equivalent:

- Heading/UI font: **Space Grotesk** (bold weights) — replaces this app's previous serif (`Fraunces`)
- Body font: **Plus Jakarta Sans** — kept, since it already matched the grotesque-sans role Misfits uses for body copy

Type scale (Misfits' named scale → this app's scale, values kept close to source):

| Token | Size / line-height |
|---|---|
| `text-heading-xl` | 2.5rem / 1.2 |
| `text-heading-lg` | 2rem / 1.2 |
| `text-heading-md` | 1.5rem / 1.2 |
| `text-heading-sm` | 1.25rem / 1.2 |
| `text-body-lg` | 1.25rem / 1.4 |
| `text-body-md` | 1rem / 1.4 |
| `text-body-sm` | 0.875rem / 1.4 |

### Spacing & layout

Misfits runs a 12-column responsive grid with breakpoints at 375 / 768 / 1024 / 1440 / 1920px and gutters scaling 10px→40px. Tailwind's default breakpoints (640/768/1024/1280/1536) already align closely at the two breakpoints this app actually uses (`sm`/`lg` ≈ 768/1024), so **breakpoints were left as Tailwind defaults** rather than overridden — remapping them app-wide was judged higher risk than value for a prototype. This is documented as a deliberate simplification, not an oversight.

### Radius

| Token | Value | Misfits source |
|---|---|---|
| `--radius-sm` | 4px | `border-radius:4px` |
| `--radius-md` | 5px | `.3125rem` (buttons) |
| `--radius-lg` | 10px | `.625rem` |
| `--radius-xl` | 15px | `15px` |
| `--radius-2xl` / `--radius-3xl` | 20px | `20px` (capped — Misfits' scale doesn't go further) |
| `--radius-full` | 9999px | pill buttons/badges |

These override Tailwind's built-in `rounded-*` scale, so every existing `rounded-lg`/`rounded-xl`/`rounded-2xl`/`rounded-3xl` usage across the app picks up the new, less-rounded, more geometric corner language automatically.

### Shadow & motion

- Soft ambient shadow: `0 0 25px rgba(45,45,45,.10)` — replaces the app's assorted `shadow-xs`/`shadow-sm`/`shadow-md` with one consistent soft glow, matching Misfits' single `.shadow-base` utility.
- Transitions: Misfits uses short, snappy durations (0.1s–0.3s, mostly `cubic-bezier(.4,0,.2,1)`). This app's existing `duration-150`–`duration-300` usage already sits in that range, so no change was needed there — confirmed as already aligned rather than rewritten.
- Interaction states: hover/active feedback is opacity-based (90%/80%) on secondary elements, plus a background-color shift on solid buttons — both patterns already existed in this app and were kept, now applied consistently via the shared `Button` component.

### Buttons (component pattern)

Misfits defines three explicit button variants, all sharing height/padding/radius/transition and differing only in fill:

| Variant | Fill | Border | Text |
|---|---|---|---|
| Primary | `--color-honey` | 2px `--color-ink` | `--color-ink` |
| Secondary | white/`--color-pale` | 2px `--color-ink` | `--color-ink` |
| Tertiary | `--color-sprout-600` | none | white |

Implemented once as `src/components/ui/Button.tsx` and reused for every primary call-to-action in the app (Add to Cart, Place Order, Save Produce, nav CTA, etc.) instead of one-off className strings.

## What could not be reliably extracted or reproduced

- **Actual font files** — Misfits' `Grotesk`/`Lufga Bold` are proprietary; substituted with the open-source `Space Grotesk`.
- **Computed/rendered styles** — no headless browser was available, so nothing about hover animations, image treatment, or pixel-level spacing could be verified visually against the live site; everything here comes from source CSS/HTML, not a rendered comparison.
- **Imagery, iconography, and copywriting style** — deliberately not extracted or copied, per the brief.
- **Full grid/breakpoint remap** — Misfits' exact 5-tier breakpoint system (375/768/1024/1440/1920) was not ported 1:1; this app keeps Tailwind's default breakpoints, which already overlap at the two sizes this layout actually uses.
- **Any A/B-tested or logged-in-only UI** — only the logged-out homepage was inspected.
