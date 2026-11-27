# Layer Packaging Platform

Build a complete landing page from scratch for a startup called Layer, focused on D2C packaging in India.

Goal:

Make it feel like a mature platform company — not a generic SaaS page, not a small agency site, and not a marketplace directory. The design should feel inspired by the clarity and confidence of Keychain / Accio style product marketing, but adapted for packaging and Indian manufacturing workflows.

Brand / positioning:

Layer is a packaging platform for D2C brands.

It helps brands search packaging needs using text + image, find reliable manufacturers, coordinate sampling and approvals, track payment, and track shipment — all in one operating layer.

The messaging should make Layer feel like infrastructure for packaging execution.

Visual direction:

- Clean, premium, minimal, mature

- White / warm off-white base with amber / gold accents

- Bold typography with strong hierarchy

- Large whitespace, clear sections, polished card system

- Feels operational, reliable, and platform-grade

- Avoid startup fluff, loud gradients, or generic “AI SaaS” styling

- Make the page look like a serious product company homepage

Typography:

- Use Space Grotesk for headings

- Use DM Sans for body

- Strong editorial headline treatment

- Tight hierarchy and clean spacing

Landing page structure:

1. Sticky header

   - Layer logo

   - Nav links: How it works, Platform film, Capabilities, FAQ

   - CTA buttons: Sign In, Request access

2. Hero section

   - Strong H1 about running packaging through one operating layer

   - Supporting paragraph explaining search, manufacturer matching, approvals, payments, shipment tracking

   - Premium search box on the landing page

   - Search should accept text input + image upload

   - Suggested search chips

   - Beside or below hero, show a mature platform preview panel that feels like a product interface, not a fake dashboard

3. Problem section

   - Explain why packaging breaks today:

     high MOQs, too many vendors, poor visibility, quality inconsistency

   - Use polished cards with clear hierarchy

4. How it works

   - 4 clear steps:

     define packaging spec

     platform pools supply / capacity

     verified manufacturers execute

     QC + delivery tracked centrally

5. Platform film section

   - Video-first section

   - Minimal layout

   - Video should be the hero

   - Small left-side workflow rail only if needed

   - Messaging around:

     search with text + image

     find reliable manufacturers

     contact / align

     track payment

     track shipment

   - Overall feel should be like a mature product walkthrough section

6. Capabilities / benefits section

   - Show the operational advantages:

     lower MOQ

     better quality consistency

     faster cycles

     fewer vendors

     clearer visibility

     repeatable production

7. Comparison / differentiation section

   - Position Layer against directories, marketplaces, and traditional sourcing workflows

   - Make it clear Layer is infrastructure, not just discovery

8. FAQ section

   - Questions around MOQ, quality, categories, manufacturers, timelines, and workflow

9. CTA section

   - Premium closing block

   - Copy should say users can share their email and brand name and “we will contact you shortly”

Important UX behavior:

- If a user clicks login, only ask for email + brand name

- If a user types in search and submits, also route them to a simple lead capture asking only for email + brand name

- After submit, show confirmation: “We will contact you shortly”

- Hero search should support image upload from the landing page

Design constraints:

- Use semantic design tokens from index.css / tailwind theme

- Use HSL variables, not hardcoded colors in components

- Keep the page responsive and polished on desktop + mobile

- Single H1 only

- Keep it visually mature and intentional

- Avoid clutter

- Refactor oversized sections into smaller components if needed

Output:

Create the full landing page in React + Tailwind with a polished, production-quality structure and copy.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://layer-packaging-platform.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/32a9328d-4c2e-444c-97d4-986aae3d7f9a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
