# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro, React islands, Tailwind CSS v4, strict TypeScript. Static output, no third-party runtime requests.

## Users

Business owners and managers of small and mid-size businesses (cafés, gyms, shops) who run a membership or loyalty program. Reference person: a manager aged 35 to 45 with little computer experience who mostly uses a phone. Premium never means more complicated.

## Product Purpose

Member+ is a multi-business membership and loyalty platform. Each business manages customers, tiered membership cards (Bronze, Silver, Gold, Onyx with metallic finishes) and purchases with discount, points and cashback. A cashier scans the printed QR on the card with a reader or the browser webcam, or types the short code, and registers the purchase in a few steps. The landing page presents the product and sends visitors to log in or request access.

Essence: "Cada cliente reconocido, cada cobro rápido." (Every customer recognized, every checkout fast.)

## Positioning

The page presents the product as it works today and makes no claims about pricing, customers or scale.

## Voice

Spanish (Mexico) by default with English at `/en/`. Second person informal ("tú"), calm and direct, no exclamation marks, no emojis. Buttons use an infinitive verb. Vocabulary: negocio, cliente, tarjeta, membresía, puntos, cashback, caja, lector.

## Constraints

- Only claim what the product does today: customer search and filters, customer profile, membership signup, renewal and cancellation, editable tiers, movements with CSV export, cashier with QR reading and receipt, public digital card with Google Wallet, isolation between businesses, platform panel, Spanish and English.
- Do not mention or imply: plans or prices (the plans section is a placeholder), online payments, public business signup, a mobile app, inventory, point redemption, branches, advanced reports, facial recognition.
- No testimonials, customer counts or customer logos. All businesses and people shown are fictional.
- Works offline: no CDNs, remote fonts, analytics or third-party images at runtime.

## Accessibility

WCAG AA contrast, 44 px touch targets, visible keyboard focus, `prefers-reduced-motion` turns the scrollytelling into a static version, language switch with native names.
