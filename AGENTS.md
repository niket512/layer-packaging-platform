# Architecture rules

- Procurement (RFQs, quotes, POs, suppliers) lives at `/dashboard/procure` with real Cloud auth and `user_roles` (founder/supplier); the catalogue dashboard keeps its no-login brand link — suppliers must only ever see their own data.
- Suppliers are linked to founders by the email on the founder's `suppliers` row matching the supplier's sign-in email — avoids a separate invite-token system.
- AI helpers go through the `procure-ai` edge function (Lovable AI, `openai/gpt-6-astra`) — keeps keys server-side.
- The manufacturer marketplace (search, store, admin review) is served on the `app.` subdomain (and `/app/*` elsewhere) by hostname check in `App.tsx` — one Lovable project, one deployment.
- Admin rights come only from an `admin` row in `user_roles` checked via `is_admin()`; users can never self-assign it.
- Catalogue PDFs go to the private `catalogue-pdfs` bucket; the browser sends the PDF's page text (or, for scanned PDFs, small page pictures) to `extract-catalogue` in small batches with a non-streamed AI call, because whole large PDFs exceed the edge function's CPU limit. Products come back as drafts with page + photo box; photos are cropped in the browser and stored as small JPEG data URLs on the row because public storage buckets are blocked for this workspace.
- Directory profiles in `src/data/manufacturers.ts` carry a `categories` array (bottles/sachets/boxes) rather than one category, so a maker that supplies several product families appears under each heading without duplicating the record.
- The public Manufacturer Discovery page (`/manufacturers`, `/manufacturers/:slug`) reads from `src/data/directory.ts` through an async fetcher with a `listing_status` gate — so it can be swapped for a backend table later without UI changes, and unconfirmed facts stay null instead of guessed.
