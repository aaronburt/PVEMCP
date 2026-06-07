import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { pveGet } from "../../client.js";

const base = {
  node: z.string().describe("Proxmox node name"),
  vmid: z.number().describe("VM ID"),
};

export function registerReadQemuTools(server: McpServer) {
  server.registerTool(
    "pve_list_vms",
    {
      description: "List all QEMU/KVM VMs on a node",
      inputSchema: { node: base.node },
    },
    async ({ node }) => {
      const data = await pveGet(`/nodes/${node}/qemu`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_vm_status",
    {
      description: "Get current status of a VM (running, stopped, CPU/RAM usage)",
      inputSchema: base,
    },
    async ({ node, vmid }) => {
      const data = await pveGet(`/nodes/${node}/qemu/${vmid}/status/current`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_vm_config",
    {
      description: "Get the full configuration of a VM",
      inputSchema: base,
    },
    async ({ node, vmid }) => {
      const data = await pveGet(`/nodes/${node}/qemu/${vmid}/config`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_vm_snapshot_list",
    {
      description: "List all snapshots of a VM",
      inputSchema: base,
    },
    async ({ node, vmid }) => {
      const data = await pveGet(`/nodes/${node}/qemu/${vmid}/snapshot`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
