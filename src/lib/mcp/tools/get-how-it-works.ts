import { defineTool } from "@lovable.dev/mcp-js";

const steps = [
  { step: 1, title: "Submit Your Brief", description: "Share your product, packaging type, quantity, and timeline." },
  { step: 2, title: "Get Matched", description: "We surface verified manufacturers suited to your requirements." },
  { step: 3, title: "Review & Approve", description: "Compare options, confirm samples, lock in pricing." },
  { step: 4, title: "Order Managed", description: "Snaplogo coordinates with the manufacturer end-to-end." },
  { step: 5, title: "Track to Delivery", description: "Real-time updates on production and shipping, no follow-up needed." },
];

export default defineTool({
  name: "get_how_it_works",
  title: "How Snaplogo works",
  description: "Explain the five-step Snaplogo sourcing journey from brief to delivery.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: steps.map((s) => `${s.step}. ${s.title} — ${s.description}`).join("\n") }],
    structuredContent: { steps },
  }),
});
