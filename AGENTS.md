# Architecture rules

- Procurement (RFQs, quotes, POs, suppliers) lives at `/dashboard/procure` with real Cloud auth and `user_roles` (founder/supplier); the catalogue dashboard keeps its no-login brand link — suppliers must only ever see their own data.
- Suppliers are linked to founders by the email on the founder's `suppliers` row matching the supplier's sign-in email — avoids a separate invite-token system.
- AI helpers go through the `procure-ai` edge function (Lovable AI, `openai/gpt-6-astra`) — keeps keys server-side.
