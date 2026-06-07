import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { pveGet } from "../../client.js";

const nodeParam = { node: z.string().describe("Node name") };

export function registerReadNetworkTools(server: McpServer) {
  server.registerTool(
    "pve_list_network",
    {
      description: "List all network interfaces configured on a node",
      inputSchema: nodeParam,
    },
    async ({ node }) => {
      const data = await pveGet(`/nodes/${node}/network`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_network_config",
    {
      description: "Get configuration of a specific network interface on a node",
      inputSchema: { ...nodeParam, iface: z.string().describe("Interface name (e.g. vmbr0, eth0)") },
    },
    async ({ node, iface }) => {
      const data = await pveGet(`/nodes/${node}/network/${iface}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
