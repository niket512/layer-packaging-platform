# Architecture rules

- Procurement (RFQs, quotes, POs, suppliers) lives at `/dashboard/procure` with real Cloud auth and `user_roles` (founder/supplier); the catalogue dashboard keeps its no-login brand link — suppliers must only ever see their own data.
- Suppliers are linked to founders by the email on the founder's `suppliers` row matching the supplier's sign-in email — avoids a separate invite-token system.
- AI helpers go through the `procure-ai` edge function (Lovable AI, `openai/gpt-6-astra`) — keeps keys server-side.
- The manufacturer marketplace (search, store, admin review) is served on the `app.` subdomain (and `/app/*` elsewhere) by hostname check in `App.tsx` — one Lovable project, one deployment.
- Admin rights come only from an `admin` row in `user_roles` checked via `is_admin()`; users can never self-assign it.
- Catalogue PDFs go to the private `catalogue-pdfs` bucket and are parsed by the `extract-catalogue` edge function into draft products (with page + photo box) the manufacturer reviews before admin approval; product photos are cropped from the PDF in the browser and stored as small JPEG data URLs on the row because public storage buckets are blocked for this workspace.
