import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { pvePost, pvePut, pveDelete } from "../../client.js";

export function registerWriteAccessTools(server: McpServer) {
  server.registerTool(
    "pve_create_user",
    {
      description: "Create a new Proxmox user",
      inputSchema: {
        userid: z.string().describe("User ID in user@realm format, e.g. john@pve"),
        password: z.string().optional().describe("Password (required for pve realm)"),
        comment: z.string().optional().describe("Description/comment"),
        email: z.string().optional().describe("Email address"),
        groups: z.string().optional().describe("Comma-separated group list"),
      },
    },
    async ({ userid, password, comment, email, groups }) => {
      const body: Record<string, unknown> = { userid };
      if (password) body.password = password;
      if (comment) body.comment = comment;
      if (email) body.email = email;
      if (groups) body.groups = groups;
      const data = await pvePost("/access/users", body);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_delete_user",
    {
      description: "Delete a Proxmox user",
      inputSchema: { userid: z.string().describe("User ID in user@realm format") },
    },
    async ({ userid }) => {
      const data = await pveDelete(`/access/users/${encodeURIComponent(userid)}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_update_acl",
    {
      description: "Add or remove an ACL rule",
      inputSchema: {
        path: z.string().describe("Resource path, e.g. / or /nodes/pve or /vms/100"),
        roles: z.string().describe("Comma-separated list of roles, e.g. PVEAdmin"),
        users: z.string().optional().describe("Comma-separated user IDs"),
        groups: z.string().optional().describe("Comma-separated group names"),
        delete_rule: z.boolean().optional().describe("If true, removes the ACL rule"),
        propagate: z.boolean().optional().describe("Propagate to child paths"),
      },
    },
    async ({ path, roles, users, groups, delete_rule, propagate }) => {
      const body: Record<string, unknown> = { path, roles };
      if (users) body.users = users;
      if (groups) body.groups = groups;
      if (delete_rule) body.delete = 1;
      if (propagate !== undefined) body.propagate = propagate ? 1 : 0;
      const data = await pvePut("/access/acl", body);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_create_api_token",
    {
      description: "Create an API token for a user",
      inputSchema: {
        userid: z.string().describe("User ID in user@realm format"),
        tokenid: z.string().describe("Token name/ID"),
        privsep: z
          .boolean()
          .optional()
          .describe("Privilege separation — if true, token has independent ACLs"),
        comment: z.string().optional().describe("Token description"),
        expire: z
          .number()
          .optional()
          .describe("Expiry as Unix timestamp (0 = never expires)"),
      },
    },
    async ({ userid, tokenid, privsep, comment, expire }) => {
      const body: Record<string, unknown> = {};
      if (privsep !== undefined) body.privsep = privsep ? 1 : 0;
      if (comment) body.comment = comment;
      if (expire !== undefined) body.expire = expire;
      const data = await pvePost(
        `/access/users/${encodeURIComponent(userid)}/token/${tokenid}`,
        body
      );
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_delete_api_token",
    {
      description: "Delete an API token",
      inputSchema: {
        userid: z.string().describe("User ID in user@realm format"),
        tokenid: z.string().describe("Token ID to delete"),
      },
    },
    async ({ userid, tokenid }) => {
      const data = await pveDelete(
        `/access/users/${encodeURIComponent(userid)}/token/${tokenid}`
      );
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}
