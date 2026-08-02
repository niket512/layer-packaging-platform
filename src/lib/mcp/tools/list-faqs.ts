import { defineTool } from "@lovable.dev/mcp-js";

const faqs = [
  { question: "What categories does Snaplogo cover?", answer: "We're starting with flexible packaging (pouches, wrappers) for FMCG brands, with more categories coming soon." },
  { question: "What MOQs can I expect?", answer: "Our manufacturer network is specifically selected to work with smaller quantities suited for emerging D2C brands." },
  { question: "How does pricing work?", answer: "You receive a clear, itemised quote before committing to any order. No hidden charges or last-minute revisions." },
  { question: "How do you ensure quality?", answer: "All manufacturers on our platform are onboarded through a verification process. We also manage sample approvals before production begins." },
  { question: "Is Snaplogo free to use?", answer: "Getting started and discovering manufacturers is free. We'll share pricing details for managed services at sign-up." },
  { question: "How long does an order typically take?", answer: "Timelines vary by product and quantity, but we'll share a clear production and delivery estimate before your order is confirmed." },
  { question: "Do you charge commissions?", answer: "No. We charge no commission and maintain complete pricing transparency with the manufacturers." },
];

export default defineTool({
  name: "list_faqs",
  title: "List FAQs",
  description: "Answer common questions about Snaplogo: categories, MOQs, pricing, quality checks, timelines and commissions.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n") }],
    structuredContent: { faqs },
  }),
});
