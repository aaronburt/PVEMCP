import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { pvePost } from "../../client.js";

const nodeParam = { node: z.string().describe("Proxmox node name (e.g. pve)") };

export function registerWriteNodeTools(server: McpServer) {
  server.registerTool(
    "pve_node_reboot",
    {
      description: "Reboot a Proxmox node",
      inputSchema: nodeParam,
    },
    async ({ node }) => {
      const data = await pvePost(`/nodes/${node}/status`, { command: "reboot" });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_node_shutdown",
    {
      description: "Shut down a Proxmox node",
      inputSchema: nodeParam,
    },
    async ({ node }) => {
      const data = await pvePost(`/nodes/${node}/status`, { command: "shutdown" });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
