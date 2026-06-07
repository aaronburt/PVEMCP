import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { pvePost, pvePut, pveDelete } from "../../client.js";

const base = {
  node: z.string().describe("Proxmox node name"),
  vmid: z.number().describe("Container ID"),
};

export function registerWriteLxcTools(server: McpServer) {
  server.registerTool(
    "pve_ct_start",
    {
      description: "Start an LXC container",
      inputSchema: base,
    },
    async ({ node, vmid }) => {
      const data = await pvePost(`/nodes/${node}/lxc/${vmid}/status/start`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_ct_stop",
    {
      description: "Hard stop an LXC container",
      inputSchema: base,
    },
    async ({ node, vmid }) => {
      const data = await pvePost(`/nodes/${node}/lxc/${vmid}/status/stop`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_ct_shutdown",
    {
      description: "Gracefully shut down an LXC container",
      inputSchema: base,
    },
    async ({ node, vmid }) => {
      const data = await pvePost(`/nodes/${node}/lxc/${vmid}/status/shutdown`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_ct_reboot",
    {
      description: "Reboot an LXC container",
      inputSchema: base,
    },
    async ({ node, vmid }) => {
      const data = await pvePost(`/nodes/${node}/lxc/${vmid}/status/reboot`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_ct_update_config",
    {
      description: "Update LXC container configuration (pass config fields as config_json)",
      inputSchema: {
        ...base,
        config_json: z
          .string()
          .describe("JSON string of config fields, e.g. {\"memory\":512,\"cores\":1}"),
      },
    },
    async ({ node, vmid, config_json }) => {
      const config = JSON.parse(config_json) as Record<string, unknown>;
      const data = await pvePut(`/nodes/${node}/lxc/${vmid}/config`, config);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_ct_create",
    {
      description: "Create a new LXC container",
      inputSchema: {
        node: base.node,
        vmid: z.number().describe("New container ID"),
        ostemplate: z.string().describe("Template, e.g. local:vztmpl/ubuntu-22.04-standard.tar.zst"),
        hostname: z.string().optional().describe("Container hostname"),
        memory: z.number().optional().describe("RAM in MB"),
        cores: z.number().optional().describe("CPU cores"),
        storage: z.string().optional().describe("Root filesystem storage pool"),
        rootfs_size: z.string().optional().describe("Root disk size, e.g. 8G"),
        password: z.string().optional().describe("Root password"),
        unprivileged: z.boolean().optional().describe("Run as unprivileged container"),
      },
    },
    async ({
      node, vmid, ostemplate, hostname, memory, cores, storage, rootfs_size, password, unprivileged,
    }) => {
      const body: Record<string, unknown> = { vmid, ostemplate };
      if (hostname) body.hostname = hostname;
      if (memory) body.memory = memory;
      if (cores) body.cores = cores;
      if (storage && rootfs_size) body.rootfs = `${storage}:${rootfs_size}`;
      if (password) body.password = password;
      if (unprivileged !== undefined) body.unprivileged = unprivileged ? 1 : 0;
      const data = await pvePost(`/nodes/${node}/lxc`, body);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_ct_delete",
    {
      description: "Delete an LXC container permanently",
      inputSchema: base,
    },
    async ({ node, vmid }) => {
      const data = await pveDelete(`/nodes/${node}/lxc/${vmid}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_ct_clone",
    {
      description: "Clone an LXC container to a new ID",
      inputSchema: {
        ...base,
        newid: z.number().describe("New container ID"),
        hostname: z.string().optional().describe("Hostname for the clone"),
      },
    },
    async ({ node, vmid, newid, hostname }) => {
      const body: Record<string, unknown> = { newid };
      if (hostname) body.hostname = hostname;
      const data = await pvePost(`/nodes/${node}/lxc/${vmid}/clone`, body);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_ct_migrate",
    {
      description: "Migrate an LXC container to another node",
      inputSchema: {
        ...base,
        target: z.string().describe("Target node name"),
        online: z.boolean().optional().describe("Live migrate while running"),
      },
    },
    async ({ node, vmid, target, online }) => {
      const body: Record<string, unknown> = { target };
      if (online !== undefined) body.online = online ? 1 : 0;
      const data = await pvePost(`/nodes/${node}/lxc/${vmid}/migrate`, body);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_ct_snapshot_create",
    {
      description: "Create a snapshot of an LXC container",
      inputSchema: {
        ...base,
        snapname: z.string().describe("Snapshot name"),
        description: z.string().optional().describe("Snapshot description"),
      },
    },
    async ({ node, vmid, snapname, description }) => {
      const body: Record<string, unknown> = { snapname };
      if (description) body.description = description;
      const data = await pvePost(`/nodes/${node}/lxc/${vmid}/snapshot`, body);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_ct_snapshot_rollback",
    {
      description: "Roll back an LXC container to a snapshot",
      inputSchema: { ...base, snapname: z.string().describe("Snapshot name to restore") },
    },
    async ({ node, vmid, snapname }) => {
      const data = await pvePost(
        `/nodes/${node}/lxc/${vmid}/snapshot/${snapname}/rollback`
      );
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
