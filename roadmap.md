# Reddit click ID correction
- [x] Validate Reddit click IDs before saving or sending them; discard the reported test value without losing saved Lead events. CAPI deployed; browser capture awaits website publishing.
- [x] Run regression tests and verify the outgoing conversion payload without creating another live lead; 13 tests passed, intercepted browser Lead omitted fake ID, build OK.

# Google Ads mobile landing
- [x] New hero badge/headline/copy, labeled "Get Packaging Quotes" CTA, suggestion chips, compact 3 steps.
- [x] Category landing routes (corrugated boxes, flexible pouches, sachets, cosmetic, mailer) with per-category copy, SEO metadata, sitemap and funnel tracking.
- [x] Verify mobile/desktop rendering and existing chat flow unbroken.

# Sourcing intake
- [x] Add private funnel reporting, scroll depth and unique catalogue views; 82 tests passed and real scroll/design/chat activity verified in signed-in admin report (one labelled test visit).
- [x] Add private administrator chat inbox with ongoing capture and historical submissions; 77 tests pass, sent test chat saved, signed-out and founder access denied.
- [x] Grant requested administrator access and verify signed-in inbox readback of the saved test conversation.
- [x] Create and verify a pouch-only design page; publish it on request.
- [x] Extend browsing with distinct box/pouch catalogues, combined filters, search, sorting and persistent shortlists.
- [x] Connect single and multiple references to the chat; test filtering and verify the live selection flow.
- [x] Improve the corrugated design catalogue with visual categories, optional filters, richer cards and a chat-connected preview; verify the selection flow.
- [x] Replace supplier suggestions with a focused question-and-answer conversation.
- [x] Collect a phone number and save the request for human follow-up.
- [x] Verify questions, phone submission and absence of supplier details.

# SEO corrections
- [x] Prepare four supplied packaging guides with readable tables, metadata, schema and internal links; verify article navigation and sourcing CTA and request publishing.
- [x] Prepare an India-wide ₹500/day Google Search campaign and launch checklist.
- [x] Prepare successful-enquiry measurement; tests pass and real chat reaches contact collection without premature conversion. Final saved-lead/Google delivery check waits for owner-approved test contact and tag setup.
- [ ] Activate Google Ads conversion tracking (blocked by missing Google tag ID and conversion label).
- [x] Strengthen existing sourcing content for box, sachet and stand-up pouch manufacturer searches; verify page and report indexing limitations.
- [x] Improve public page titles, descriptions and social metadata; verify route transitions.
- [x] Add a sitemap of public pages and reference it in crawler instructions.
- [x] Verify corrections and update the reported SEO findings.

# Corrugated-box questions
- [x] Tailor optional sourcing questions to the supplied corrugated-box options, retaining the five-question limit.
- [x] Test option coverage and verify the live chat.

# Faster sourcing replies
- [x] Measure current response delays and reduce streaming/context overhead without changing model or quotation quality; verified provisional replies, full intake and 73 tests. Total latency still varies.
- [x] Show questions as they arrive without changing the AI model or reducing question coverage.
- [x] Skip unnecessary AI calls after the question budget is exhausted and verify the conversation.

# Flexible-packaging questions
- [x] Add snippet-based sachet, pouch and film requirements without catalogue changes.
- [x] Verify relevant missing questions, no repeated details and the phone follow-up transition.

# Quotation-focused questions
- [x] Treat five as a ceiling, remove routine timeline questions, and prioritize only quotation-relevant missing specifications.
- [x] Test the question rules and verify the supplied capa-board request in the live chat.

# One-round quotation intake
- [x] Ask quotation questions once, then collect optional design/details and a WhatsApp number.
- [x] Preserve unsent designs/details during contact submission and test the complete flow.

# Chat-only design sharing
- [x] Collect designs through chat only and skip the design prompt when images were already sent.
- [x] Analyze initial images before asking missing quotation details and verify the flows.

# Context-aware sourcing conversation
- [x] Analyze every reply and prevent greetings, refusals and unrelated messages from advancing to design/contact.
- [x] Preserve quotation limits, image handling and chat history; test the reported HEY / NOTHING case and genuine sourcing replies.

# Expert sourcing experience
- [x] Extract and show an editable, evidence-backed sourcing brief without extra AI calls.
- [x] Keep missing quotation questions grouped; clarify follow-up, improve request titles/statuses and submission review.
- [x] Test grouped questions, brief corrections and the full chat submission flow.