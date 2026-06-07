import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { pveGet } from "../../client.js";

const base = {
  node: z.string().describe("Proxmox node name"),
  vmid: z.number().describe("Container ID"),
};

export function registerReadLxcTools(server: McpServer) {
  server.registerTool(
    "pve_list_containers",
    {
      description: "List all LXC containers on a node",
      inputSchema: { node: base.node },
    },
    async ({ node }) => {
      const data = await pveGet(`/nodes/${node}/lxc`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_ct_status",
    {
      description: "Get current status of an LXC container",
      inputSchema: base,
    },
    async ({ node, vmid }) => {
      const data = await pveGet(`/nodes/${node}/lxc/${vmid}/status/current`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_ct_config",
    {
      description: "Get full configuration of an LXC container",
      inputSchema: base,
    },
    async ({ node, vmid }) => {
      const data = await pveGet(`/nodes/${node}/lxc/${vmid}/config`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_ct_snapshot_list",
    {
      description: "List all snapshots of an LXC container",
      inputSchema: base,
    },
    async ({ node, vmid }) => {
      const data = await pveGet(`/nodes/${node}/lxc/${vmid}/snapshot`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
