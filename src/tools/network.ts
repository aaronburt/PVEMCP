import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { pveGet, pvePost, pvePut, pveDelete, isReadOnly } from "../client.js";

const nodeParam = { node: z.string().describe("Node name") };

export function registerNetworkTools(server: McpServer) {
  server.registerTool(
    "pve_list_network",
    {
      description: "List all network interfaces configured on a node",
      inputSchema: nodeParam,
    },
    async ({ node }) => {
      const data = await pveGet(`/nodes/${node}/network`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  server.registerTool(
    "pve_network_config",
    {
      description: "Get configuration of a specific network interface on a node",
      inputSchema: { ...nodeParam, iface: z.string().describe("Interface name (e.g. vmbr0, eth0)") },
    },
    async ({ node, iface }) => {
      const data = await pveGet(`/nodes/${node}/network/${iface}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  if (!isReadOnly) {
    server.registerTool(
      "pve_create_network",
      {
        description: "Create a new network interface or bridge on a node (config_json contains interface params)",
        inputSchema: {
          ...nodeParam,
          iface: z.string().describe("Interface name"),
          type: z
            .enum(["bridge", "bond", "eth", "alias", "vlan", "OVSBridge", "OVSBond", "OVSPort", "OVSIntPort"])
            .describe("Interface type"),
          config_json: z
            .string()
            .optional()
            .describe("JSON string of additional params, e.g. {\"address\":\"10.0.0.1\",\"netmask\":\"255.255.255.0\"}"),
        },
      },
      async ({ node, iface, type, config_json }) => {
        const extra = config_json ? (JSON.parse(config_json) as Record<string, unknown>) : {};
        const data = await pvePost(`/nodes/${node}/network`, { iface, type, ...extra });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );

    server.registerTool(
      "pve_update_network",
      {
        description: "Update an existing network interface on a node",
        inputSchema: {
          ...nodeParam,
          iface: z.string().describe("Interface name"),
          config_json: z
            .string()
            .describe("JSON string of params to update, e.g. {\"address\":\"10.0.0.2\"}"),
        },
      },
      async ({ node, iface, config_json }) => {
        const config = JSON.parse(config_json) as Record<string, unknown>;
        const data = await pvePut(`/nodes/${node}/network/${iface}`, config);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );

    server.registerTool(
      "pve_delete_network",
      {
        description: "Delete a network interface from a node",
        inputSchema: { ...nodeParam, iface: z.string().describe("Interface name to delete") },
      },
      async ({ node, iface }) => {
        const data = await pveDelete(`/nodes/${node}/network/${iface}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );

    server.registerTool(
      "pve_apply_network",
      {
        description: "Apply pending network configuration changes on a node (writes /etc/network/interfaces)",
        inputSchema: nodeParam,
      },
      async ({ node }) => {
        const data = await pvePut(`/nodes/${node}/network`, {});
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }
    );
  }
}
