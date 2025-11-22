import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
 import { extractAndSavePDF } from "@/inngest/agent";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [extractAndSavePDF],
});