import { defineMcp } from "@lovable.dev/mcp-js";
import listProductCategories from "./tools/list-product-categories";
import listFaqs from "./tools/list-faqs";
import getHowItWorks from "./tools/get-how-it-works";
import submitSignupRequest from "./tools/submit-signup-request";

export default defineMcp({
  name: "layer-packaging-platform",
  title: "Layer Packaging Platform",
  version: "0.1.0",
  instructions:
    "Tools for Snaplogo, a B2B sourcing platform connecting Indian D2C brands with verified packaging manufacturers. Use `list_product_categories`, `get_how_it_works` and `list_faqs` to answer questions about the platform, and `submit_signup_request` to register a brand's interest so the team can follow up.",
  tools: [listProductCategories, getHowItWorks, listFaqs, submitSignupRequest],
});
