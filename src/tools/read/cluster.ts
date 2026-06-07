import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { pveGet } from "../../client.js";

export function registerReadClusterTools(server: McpServer) {
  server.registerTool(
    "pve_cluster_status",
    {
      description: "Get overall Proxmox cluster health and node states",
    },
    async () => {
      const data = await pveGet("/cluster/status");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_cluster_resources",
    {
      description: "List all resources (VMs, containers, storage, nodes) across the cluster",
      inputSchema: {
        type: z
          .enum(["vm", "storage", "node", "sdn"])
          .optional()
          .describe("Filter by resource type"),
      },
    },
    async ({ type }) => {
      const qs = type ? `?type=${type}` : "";
      const data = await pveGet(`/cluster/resources${qs}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_cluster_tasks",
    {
      description: "List recent cluster-wide tasks",
    },
    async () => {
      const data = await pveGet("/cluster/tasks");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
