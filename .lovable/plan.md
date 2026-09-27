# Snaplogo Procure — end-to-end procurement for early founders

Built inside the current Snaplogo dashboard, for any category (packaging catalogue stays as a sourcing source). Two kinds of users: **founders** and **suppliers**, each with their own sign-in.

## What founders get
1. **Requests for quote (RFQs)** — describe what you need (item, quantity, target price, deadline, specs, files). "Draft with AI" turns a one-line ask into a complete RFQ. Invite suppliers from your directory or from Snaplogo's manufacturer profiles.
2. **Quote comparison** — suppliers' quotes side by side (unit price, MOQ, lead time, terms). "Compare with AI" gives a recommendation and flags risks (missing specs, long lead time, outlier pricing). Award a quote in one click.
3. **Purchase orders** — awarding creates a PO draft; founder approves and sends it. Status: Draft, Sent, Accepted, In production, Shipped, Delivered, Closed.
4. **Order tracking** — timeline per PO with supplier updates, expected ship date, notes and attachments; overview of all active orders.
5. **Supplier directory** — add suppliers (name, category, location, contact, rating, documents), see their quote and order history, invite them to sign in.

## What suppliers get
- Sign in, see RFQs they were invited to, submit and revise quotes.
- See POs sent to them, accept, and post status updates through delivery.

## Navigation (inside the dashboard)
```text
Overview | RFQs | Purchase orders | Suppliers | Catalogue (existing bottles + sachets) | Shortlist
Supplier view: Invites | My quotes | My orders
```
The Overview only shows real counts from the founder's own data — empty states until they create something.

## Sign-in change (decision needed on approval)
Real accounts are required so suppliers only see their own RFQs and orders. Founders and suppliers sign up with email/password or Google and pick their role. The public no-login link `/dashboard/gramiyaa` stays as a read-only catalogue view; procurement features require sign-in.

## Technical details
- Lovable Cloud auth (email + Google); `profiles` (display name, company) and a separate `user_roles` table (`founder`, `supplier`) with a `has_role` security-definer function.
- Tables: `organizations`, `suppliers`, `rfqs`, `rfq_items`, `rfq_invites`, `quotes`, `purchase_orders`, `po_updates`, all with GRANTs and RLS: founders access rows of their organization; suppliers access only RFQs they're invited to and POs addressed to them.
- Storage bucket for RFQ/PO attachments with matching access rules.
- One edge function `procure-ai` using the Lovable AI gateway (`openai/gpt-6-astra`, streamed) for "Draft RFQ" and "Compare quotes"; errors (credits, rate limits) shown in the UI.
- New pages/components under `src/components/procure/`; routes `/auth`, `/dashboard/procure/*`. Existing catalogue, shortlist and landing untouched. Orange Snaplogo theme tokens.
- Built in stages: auth + roles + suppliers → RFQs + quotes → POs + tracking → AI helpers, verifying each end to end.
