import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { pveGet, pvePost, pvePut, pveDelete, isReadOnly } from "../client.js";

const base = {
  node: z.string().describe("Proxmox node name"),
  vmid: z.number().describe("VM ID"),
};

export function registerQemuTools(server: McpServer) {
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

  if (!isReadOnly) {
    server.registerTool(
      "pve_vm_start",
      {
        description: "Start a VM",
        inputSchema: base,
      },
      async ({ node, vmid }) => {
        const data = await pvePost(`/nodes/${node}/qemu/${vmid}/status/start`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );

    server.registerTool(
      "pve_vm_stop",
      {
        description: "Hard stop a VM (immediate power cut)",
        inputSchema: base,
      },
      async ({ node, vmid }) => {
        const data = await pvePost(`/nodes/${node}/qemu/${vmid}/status/stop`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );

    server.registerTool(
      "pve_vm_shutdown",
      {
        description: "Gracefully shut down a VM via ACPI",
        inputSchema: base,
      },
      async ({ node, vmid }) => {
        const data = await pvePost(`/nodes/${node}/qemu/${vmid}/status/shutdown`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );

    server.registerTool(
      "pve_vm_reboot",
      {
        description: "Reboot a VM",
        inputSchema: base,
      },
      async ({ node, vmid }) => {
        const data = await pvePost(`/nodes/${node}/qemu/${vmid}/status/reboot`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );

    server.registerTool(
      "pve_vm_reset",
      {
        description: "Hard reset a VM (equivalent to pressing reset button)",
        inputSchema: base,
      },
      async ({ node, vmid }) => {
        const data = await pvePost(`/nodes/${node}/qemu/${vmid}/status/reset`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );

    server.registerTool(
      "pve_vm_suspend",
      {
        description: "Suspend a VM",
        inputSchema: base,
      },
      async ({ node, vmid }) => {
        const data = await pvePost(`/nodes/${node}/qemu/${vmid}/status/suspend`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );

    server.registerTool(
      "pve_vm_resume",
      {
        description: "Resume a suspended VM",
        inputSchema: base,
      },
      async ({ node, vmid }) => {
        const data = await pvePost(`/nodes/${node}/qemu/${vmid}/status/resume`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );
  }

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

  if (!isReadOnly) {
    server.registerTool(
      "pve_vm_update_config",
      {
        description: "Update VM configuration (pass any valid Proxmox VM config keys as config_json)",
        inputSchema: {
          ...base,
          config_json: z
            .string()
            .describe("JSON string of config fields to update, e.g. {\"memory\":2048,\"cores\":2}"),
        },
      },
      async ({ node, vmid, config_json }) => {
        const config = JSON.parse(config_json) as Record<string, unknown>;
        const data = await pvePut(`/nodes/${node}/qemu/${vmid}/config`, config);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );

    server.registerTool(
      "pve_vm_create",
      {
        description: "Create a new QEMU/KVM VM",
        inputSchema: {
          node: base.node,
          vmid: z.number().describe("New VM ID (must be unique)"),
          name: z.string().optional().describe("VM name"),
          memory: z.number().optional().describe("RAM in MB"),
          cores: z.number().optional().describe("CPU cores"),
          sockets: z.number().optional().describe("CPU sockets"),
          ostype: z.string().optional().describe("OS type (l26, win10, etc.)"),
          iso: z.string().optional().describe("ISO image path, e.g. local:iso/ubuntu.iso"),
          storage: z.string().optional().describe("Storage pool for disk"),
          disk_size: z.string().optional().describe("Disk size, e.g. 32G"),
        },
      },
      async ({ node, vmid, name, memory, cores, sockets, ostype, iso, storage, disk_size }) => {
        const body: Record<string, unknown> = { vmid };
        if (name) body.name = name;
        if (memory) body.memory = memory;
        if (cores) body.cores = cores;
        if (sockets) body.sockets = sockets;
        if (ostype) body.ostype = ostype;
        if (iso) body.cdrom = iso;
        if (storage && disk_size) body.scsi0 = `${storage}:${disk_size}`;
        const data = await pvePost(`/nodes/${node}/qemu`, body);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );

    server.registerTool(
      "pve_vm_delete",
      {
        description: "Delete a VM permanently",
        inputSchema: base,
      },
      async ({ node, vmid }) => {
        const data = await pveDelete(`/nodes/${node}/qemu/${vmid}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );

    server.registerTool(
      "pve_vm_clone",
      {
        description: "Clone a VM to a new VM ID",
        inputSchema: {
          ...base,
          newid: z.number().describe("New VM ID for the clone"),
          name: z.string().optional().describe("Name for the cloned VM"),
          full: z.boolean().optional().describe("Full clone (true) or linked clone (false)"),
          target: z.string().optional().describe("Target node for the clone"),
        },
      },
      async ({ node, vmid, newid, name, full, target }) => {
        const body: Record<string, unknown> = { newid };
        if (name) body.name = name;
        if (full !== undefined) body.full = full ? 1 : 0;
        if (target) body.target = target;
        const data = await pvePost(`/nodes/${node}/qemu/${vmid}/clone`, body);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );

    server.registerTool(
      "pve_vm_migrate",
      {
        description: "Migrate a VM to another node",
        inputSchema: {
          ...base,
          target: z.string().describe("Target node name"),
          online: z.boolean().optional().describe("Live migration while running"),
        },
      },
      async ({ node, vmid, target, online }) => {
        const body: Record<string, unknown> = { target };
        if (online !== undefined) body.online = online ? 1 : 0;
        const data = await pvePost(`/nodes/${node}/qemu/${vmid}/migrate`, body);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );
  }

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

  if (!isReadOnly) {
    server.registerTool(
      "pve_vm_snapshot_create",
      {
        description: "Create a snapshot of a VM",
        inputSchema: {
          ...base,
          snapname: z.string().describe("Snapshot name"),
          description: z.string().optional().describe("Snapshot description"),
          vmstate: z.boolean().optional().describe("Include RAM state"),
        },
      },
      async ({ node, vmid, snapname, description, vmstate }) => {
        const body: Record<string, unknown> = { snapname };
        if (description) body.description = description;
        if (vmstate !== undefined) body.vmstate = vmstate ? 1 : 0;
        const data = await pvePost(`/nodes/${node}/qemu/${vmid}/snapshot`, body);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );

    server.registerTool(
      "pve_vm_snapshot_delete",
      {
        description: "Delete a VM snapshot",
        inputSchema: { ...base, snapname: z.string().describe("Snapshot name to delete") },
      },
      async ({ node, vmid, snapname }) => {
        const data = await pveDelete(`/nodes/${node}/qemu/${vmid}/snapshot/${snapname}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );

    server.registerTool(
      "pve_vm_snapshot_rollback",
      {
        description: "Roll back a VM to a snapshot",
        inputSchema: { ...base, snapname: z.string().describe("Snapshot name to roll back to") },
      },
      async ({ node, vmid, snapname }) => {
        const data = await pvePost(
          `/nodes/${node}/qemu/${vmid}/snapshot/${snapname}/rollback`
        );
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );
  }
}
