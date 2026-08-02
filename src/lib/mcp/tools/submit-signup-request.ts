import { ToolError, defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "submit_signup_request",
  title: "Submit a Snaplogo sign-up request",
  description:
    "Submit a sign-up / access request on behalf of a brand so the Snaplogo team can reach out. Requires the brand name, a contact email and a description of the packaging requirement.",
  inputSchema: {
    brand: z.string().trim().min(1).max(100).describe("Brand or company name."),
    email: z.string().trim().min(3).max(255).describe("Contact email address."),
    requirement: z
      .string()
      .trim()
      .min(1)
      .max(1000)
      .describe("What the brand needs, e.g. '5,000 stand-up pouches for a snacks launch'."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ brand, email, requirement }) => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new ToolError("Please provide a valid email address.");
    }
    const supabase = supabaseAnon();
    const { error } = await supabase
      .from("access_requests")
      .insert({ brand, email, requirement });
    if (error) throw new ToolError(error.message);
    return {
      content: [
        {
          type: "text",
          text: `Sign-up request submitted for ${brand}. The Snaplogo team will reach out at ${email}.`,
        },
      ],
      structuredContent: { submitted: true, brand, email },
    };
  },
});
