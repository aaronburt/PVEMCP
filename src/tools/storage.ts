import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { pveGet, pveDelete, isReadOnly } from "../client.js";

export function registerStorageTools(server: McpServer) {
  server.registerTool(
    "pve_list_storage",
    {
      description: "List all storage pools defined in the Proxmox cluster",
    },
    async () => {
      const data = await pveGet("/storage");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_node_storage_status",
    {
      description: "Get status and usage of storage pools visible on a node",
      inputSchema: { node: z.string().describe("Node name") },
    },
    async ({ node }) => {
      const data = await pveGet(`/nodes/${node}/storage`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_storage_content",
    {
      description: "List all files (ISOs, templates, disk images) in a storage pool on a node",
      inputSchema: {
        node: z.string().describe("Node name"),
        storage: z.string().describe("Storage pool name (e.g. local, local-lvm)"),
        content: z
          .enum(["iso", "vztmpl", "backup", "images", "rootdir", "snippets"])
          .optional()
          .describe("Filter by content type"),
      },
    },
    async ({ node, storage, content }) => {
      const qs = content ? `?content=${content}` : "";
      const data = await pveGet(`/nodes/${node}/storage/${storage}/content${qs}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  if (!isReadOnly) {
    server.registerTool(
      "pve_storage_delete_volume",
      {
        description: "Delete a volume from a storage pool",
        inputSchema: {
          node: z.string().describe("Node name"),
          storage: z.string().describe("Storage pool name"),
          volume: z.string().describe("Volume ID, e.g. local:iso/ubuntu.iso"),
        },
      },
      async ({ node, storage, volume }) => {
        const encoded = encodeURIComponent(volume);
        const data = await pveDelete(
          `/nodes/${node}/storage/${storage}/content/${encoded}`
        );
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );
  }
}
