import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { pveGet } from "../../client.js";

export function registerReadAccessTools(server: McpServer) {
  server.registerTool(
    "pve_list_users",
    {
      description: "List all users in the Proxmox access control system",
    },
    async () => {
      const data = await pveGet("/access/users");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_list_roles",
    {
      description: "List all available roles and their privileges",
    },
    async () => {
      const data = await pveGet("/access/roles");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_list_acl",
    {
      description: "List all ACL (access control) rules",
    },
    async () => {
      const data = await pveGet("/access/acl");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_list_api_tokens",
    {
      description: "List API tokens for a user",
      inputSchema: { userid: z.string().describe("User ID in user@realm format") },
    },
    async ({ userid }) => {
      const data = await pveGet(`/access/users/${encodeURIComponent(userid)}/token`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
