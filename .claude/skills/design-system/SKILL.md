---
name: design-system
description: Use when building or restyling any UI in this storefront (pages, layouts, headers, product cards, grids, PDPs, carts, forms, buttons, links). Covers the monochrome editorial design system in src/app/globals.css, including its color tokens, type scale, spacing, containers, buttons, links, fields and responsive layout primitives, and the rules for using them.
---

# Storefront design system

The source of truth is `src/app/globals.css` (Tailwind v4, CSS-first, no `tailwind.config`). Read it before adding styles. Build UI from the tokens and classes below. Don't use raw hex values, Tailwind palette colors (`zinc-*`, `gray-*`, `black`, `white`) or arbitrary values when a token exists.

## Principles

- **Monochrome and image-led.** The UI is black on white. Colour comes from product photography. Use `accent`, `danger` and `success` sparingly and only for meaning (sale price, error, confirmation).
- **Square and hairline.** Never use `rounded-*` on UI (buttons, cards, inputs, images, modals). Borders are 1px, `border-line` by default and `border-line-strong` for emphasis. No drop shadows. Use a hairline or a `surface` fill to separate things.
- **Quiet type.** One sans font (Geist, `font-sans`). Headings use weight 400, never bold. Hierarchy comes from size, whitespace and uppercase tracked labels.
- **Generous whitespace.** Separate sections with `py-section`. Don't cram content.
- **Slow, soft motion.** Use the default transition or `ease-luxe`. No bounce or scale-pop effects. Reduced motion is already handled globally.

## Tokens

### Color (`bg-*`, `text-*`, `border-*`)

| Token | Use |
|---|---|
| `canvas` | page background |
| `surface` / `surface-strong` | image backdrops, subtle panels, hover fills |
| `ink` | primary text, primary button fill |
| `ink-muted` | secondary copy, meta, prices on a sale line |
| `ink-subtle` | placeholders, disabled |
| `line` / `line-strong` | hairlines / outlined buttons, focused fields |
| `accent`, `danger`, `success` | meaning only |

To flip a region to white on black (promo bands, hero overlays, footer), add the **`.theme-inverse`** class. Every token inside it swaps, so children need no changes. Don't hand-code `bg-black text-white`.

### Type (`text-*`; size, line height, tracking and weight come bundled)

| Class | Size | Use |
|---|---|---|
| `text-label` | 11px, uppercase via `eyebrow` | nav, buttons, filters, tabs |
| `text-caption` | 12px | meta, legal, swatch names |
| `text-body` | 14px (body default) | UI copy, product names, prices |
| `text-body-lg` | 16px | long-form copy, inputs |
| `text-title` | 20px | PDP product name, drawer and panel titles |
| `text-headline` | fluid 28 → 44px | section headings |
| `text-display` | fluid 40 → 104px | campaign heroes only |

`eyebrow` is the uppercase label style: 11px, weight 500, 0.1em tracking. Use it for nav items, section kickers, filter and sort labels, and tab labels. `tracking-wide-label` (0.18em) is for sparse, standalone labels.

### Spacing (responsive; works with any spacing utility: `px-`, `py-`, `gap-`, `h-`, `top-`, `mt-`, …)

| Token | Mobile → md → lg |
|---|---|
| `gutter` | 16 → 24 → 40px (page side padding) |
| `section` | 48 → 72 → 96px (vertical section rhythm) |
| `grid-x` / `grid-y` | column / row gap of product grids |
| `header` | header height, 56 → 64px (`h-header`, `top-header`, `scroll-mt-header`) |

Otherwise use the standard Tailwind 4px scale.

### Other

- Max widths: `max-w-page` (120rem), `max-w-content` (80rem), `max-w-reading` (42rem).
- Aspect ratios: `aspect-product` (4/5, **the default for product images**), `aspect-portrait` (3/4), `aspect-square`, `aspect-campaign` (16/9), `aspect-campaign-tall` (4/5, mobile heroes, e.g. `aspect-campaign-tall md:aspect-campaign`).
- Breakpoints: Tailwind defaults plus `3xl` (120rem). Design mobile-first.

## Components (plain classes; utilities override them)

- **Buttons:** always combine `btn` with one variant.
  - `btn-primary`: solid ink, **one per view** (Add to bag, Checkout, Sign in).
  - `btn-secondary`: outlined, fills with ink on hover.
  - `btn-ghost`: borderless, for header icons and tertiary actions.
  - Sizes: `btn-sm` (40px), default (48px), `btn-lg` (56px), `btn-icon` (44px square). `btn-block` makes a button full width (mobile CTAs, forms).
  - Disabled buttons use `disabled` or `aria-disabled="true"`, never custom opacity.
  - Button labels are short and are uppercased by the class. Write them in sentence case in JSX.
- **Links:**
  - `link`: underlined inline text link, for body copy and legal text.
  - `link-reveal`: underline draws in on hover, focus and `aria-current="page"`. Use it for nav and "Discover"-style CTAs.
  - Other links stay undecorated.
- **Fields:** `field` on `input`, `select` and `textarea` gives an underline-only input at 16px. Use `aria-invalid="true"` for the error state and put the error message in `text-caption text-danger` below the field. Labels use `eyebrow text-ink-muted`.

- **Option pickers:** a `<label>` wrapping a radio `<input>` (the class hides it). `chip` is a square text option (sizes): checked fills with ink, `disabled` is struck through. `swatch` shows a colour square from an inline `--swatch` value and gets an ink frame when checked.

## Layout primitives (Tailwind utilities; accept variants such as `md:`)

- `container-page`: the default page shell (centred, max-w-page, gutter padding).
- `container-content`, `container-reading`: narrower shells for account pages, checkout, editorial and legal text.
- `section`: vertical padding of `--section-y`.
- `grid-products`: product listing grid, 2 / 3 (md) / 4 (xl) columns.
- `grid-split`: 1 column, 2 from md (editorial image pairs, PDP gallery and info).
- `media-frame`: `relative overflow-hidden bg-surface`, and the direct `img`, `video` or `picture > img` fills and covers it. Combine it with an aspect class.
- `rail`: horizontal snap carousel showing 70% / 40% / 25% width items. Put it inside a container, or pair it with `full-bleed px-gutter` so it runs edge to edge.
- `gallery`: PDP images. A swipe rail with an 88% peek on mobile (pair it with `-mx-gutter md:mx-0`), and a vertical stack from md.
- `full-bleed`: breaks out of a container to the full viewport width.
- `divider`: a 1px `line` rule (use on `<hr>`).
- `below-header`: top padding equal to the header height, for pages under a fixed header.

## Patterns

Product card:

```tsx
<article className="group">
  <a href={href} className="block">
    <div className="media-frame aspect-product">
      <Image src={src} alt={name} fill sizes="(min-width:80rem) 25vw, (min-width:48rem) 33vw, 50vw" className="transition-opacity duration-500 group-hover:opacity-90" />
    </div>
    <div className="mt-3 space-y-1 px-1">
      <h3 className="text-body">{name}</h3>
      <p className="text-body text-ink-muted">{price}</p>
    </div>
  </a>
</article>
```

Section with a heading:

```tsx
<section className="section">
  <div className="container-page">
    <p className="eyebrow text-ink-muted">New season</p>
    <h2 className="text-headline mt-3">Section title</h2>
    <div className="grid-products mt-10">{/* cards */}</div>
  </div>
</section>
```

Header: `sticky top-0 z-40 h-header bg-canvas border-b border-line`, with a `container-page flex h-full items-center justify-between` inner element. Nav items use `eyebrow link-reveal`, icons use `btn btn-ghost btn-icon`, and the wordmark is centred.

## Rules for changing the system

- Add or change tokens in `globals.css` only. Raw values go in `:root` (and in `.theme-inverse` if they are colours), exposed through `@theme inline`. Static values go in `@theme`. Responsive values change `:root` vars inside `@media (width >= …)` blocks.
- CSS written in `globals.css` reads the raw vars (`var(--ink)`), not `var(--color-ink)`. The `--color-*` aliases resolve on `:root` and don't follow `.theme-inverse`.
- Put reusable multi-property patterns in `globals.css`: component classes in `@layer components`, responsive primitives as `@utility`. Don't copy them as long class strings.
- Don't reintroduce Tailwind palette colours, rounded corners, shadows or bold headings.
- Check that text contrast stays at WCAG AA or above, on both `canvas` and `surface`.
