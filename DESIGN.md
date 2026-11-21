# Design

System: "Claridad premium" (clarity with a premium finish). Source of truth for tokens is `src/styles/global.css`; this file records how the landing applies them.

## Principles

- Light theme by default, always. Dark only through a manual `data-theme="dark"` attribute.
- Lots of air. Navy-tinted neutrals. One strong color: primary blue `#0062f2`, used on a single main action per view ("Iniciar sesión").
- Soft depth: 1 px borders and long, faint shadows. No hard shadows.
- Premium lives in the membership card (metallic tier finishes). Everything else stays sober.
- Brand gradient (`#01befe` to `#0062f2` to `#012874`, 135 degrees) only in brand moments: hero aura, closing band, digital card. Never on buttons.

## Typography

- Montserrat: headlines and large figures.
- Geist: body, labels, buttons.
- Geist Mono: card codes (`MP-XXXXX`).
- Scale: `text-display`, `text-title`, `text-heading`, `text-subheading`, `text-lg`, `text-base`, `text-sm`, `text-xs`. Figures use `tabular-nums`.

## Shape and depth

Radius: buttons and fields `rounded-md`, cards `rounded-lg`, membership card `rounded-card`, modal-like blocks `rounded-xl`, badges `rounded-full`. Shadows `shadow-xs` to `shadow-lg`.

## Landing exceptions

- Glass surfaces: `bg-surface/70`, `backdrop-blur`, 1 px `border-border`, contrast checked for AA.
- Scroll-linked motion and CSS 3D are exempt from the 300 ms rule. Timed animations stay under 300 ms (hero entrance up to about 900 ms in total), `ease-out` or `ease-in-out`, transform and opacity only.
- `--primary-text` is darkened 15 percent so blue text on `primary-soft` reaches AA.

## Components

Button (primary, outline), membership card (4 tiers, sizes md and sm), device frame, window frame, glass cards, tab list for sample businesses, purchase breakdown, plan cards (placeholders).
