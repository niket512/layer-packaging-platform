import { defineTool } from "@lovable.dev/mcp-js";

const categories = [
  {
    name: "Stand-Up Pouches",
    description:
      "Custom printed, food-grade stand-up pouches with flexible MOQs. Suited to snacks, supplements and pantry brands.",
  },
  {
    name: "Flat & Pillow Pouches",
    description:
      "Lightweight, cost-effective packaging for sachets, powders and single-serve formats.",
  },
  {
    name: "Custom Wrappers",
    description:
      "High-quality printed wrappers for confectionery, bakery and FMCG products.",
  },
  {
    name: "Flexible Packaging",
    description: "Laminates and flexible films engineered for FMCG shelf life and print quality.",
  },
  {
    name: "Custom Rollstock",
    description: "Printed rollstock for automated form-fill-seal lines.",
  },
  {
    name: "Labels & Stickers",
    description: "Product labels, stickers and shrink sleeves in a range of finishes.",
  },
];

export default defineTool({
  name: "list_product_categories",
  title: "List product categories",
  description:
    "List the packaging product categories Snaplogo currently sources from its verified manufacturer network.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: categories.map((c) => `- ${c.name}: ${c.description}`).join("\n"),
      },
    ],
    structuredContent: { categories },
  }),
});
