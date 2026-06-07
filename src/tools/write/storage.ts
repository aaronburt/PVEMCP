import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { pveDelete } from "../../client.js";

export function registerWriteStorageTools(server: McpServer) {
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
