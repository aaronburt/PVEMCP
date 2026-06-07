import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { pveGet } from "../../client.js";

const nodeParam = { node: z.string().describe("Proxmox node name (e.g. pve)") };

export function registerReadNodeTools(server: McpServer) {
  server.registerTool(
    "pve_list_nodes",
    {
      description: "List all nodes in the Proxmox cluster",
    },
    async () => {
      const data = await pveGet("/nodes");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_node_status",
    {
      description: "Get CPU, RAM, uptime and status for a specific node",
      inputSchema: nodeParam,
    },
    async ({ node }) => {
      const data = await pveGet(`/nodes/${node}/status`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_node_syslog",
    {
      description: "Retrieve system log entries from a node",
      inputSchema: {
        ...nodeParam,
        limit: z.number().optional().describe("Max log lines to return (default 50)"),
      },
    },
    async ({ node, limit }) => {
      const qs = limit ? `?limit=${limit}` : "?limit=50";
      const data = await pveGet(`/nodes/${node}/syslog${qs}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_node_tasks",
    {
      description: "List recent tasks on a specific node",
      inputSchema: nodeParam,
    },
    async ({ node }) => {
      const data = await pveGet(`/nodes/${node}/tasks`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
