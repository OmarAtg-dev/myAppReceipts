import {
    anthropic,
    createNetwork,getDefaultRoutingAgent
} from "@inngest/agent-kit";
import { createServer } from "@inngest/agent-kit/server";
import Events from "./constants";
import { inngest } from "./client";
import { databaseAgent } from "./agents/databaseAgent";
import { receiptScanningAgent } from "./agents/receiptScaningAgent";

console.log("[inngest] registering agents:", {
    databaseAgent: databaseAgent.name,
    receiptScanningAgent: receiptScanningAgent.name,
});

const agentNetwork = createNetwork({
    name: "Agent Team",
    agents: [receiptScanningAgent, databaseAgent],
    defaultModel: anthropic({
        // model: "claude-3-5-sonnet-latest",
        model: "claude-3-5-haiku-latest", // Use the exact dated version

        defaultParameters: {
            max_tokens: 1000,
        },
    }),
    defaultRouter: ({ network }) => {
        const savedToDatabase = network.state.data["saved-to-database"];

        if (savedToDatabase !== undefined) {
            // console.log('savedToDatabase .....' + savedToDatabase);
            // Terminate the agent process if the data has been saved to the database
            return undefined;
        }

        // Return the agents directly - this allows the network to route to them 
        // getDefaultRoutingAgent(); 
        // console.log('savedToDatabase .....' ,getDefaultRoutingAgent() );
         return Array.from(network.agents.values());
        // return getDefaultRoutingAgent(); 
    },
});

export const server = createServer({
    agents: [receiptScanningAgent,databaseAgent],
    networks: [agentNetwork],
});

export const processReceiptFile = inngest.createFunction(
    { id: "Process Receipt File and Save in Database" },
    { event: Events.PROCESS_RECEIPT_FILE_AND_SAVE_TO_DATABASE },
    async ({ event }) => {
      const { url, receiptId, mimeType } = event.data as {
        url: string;
        receiptId: string;
        mimeType?: string;
      };

      const result = await agentNetwork.run(
        `Extract the key data from this receipt file (MIME type: ${mimeType ?? "unknown"}): ${url}.
Use the "analyze-receipt-file" tool with both the fileUrl and mimeType so you can read the binary contents, 
then save the structured data to the database using the receiptId: ${receiptId}.`,
      );
  
      return result.state.data["receipt"];
    },
  );
  