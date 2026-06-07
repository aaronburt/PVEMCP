import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { pvePost, pvePut, pveDelete } from "../../client.js";

const nodeParam = { node: z.string().describe("Node name") };

export function registerWriteNetworkTools(server: McpServer) {
  server.registerTool(
    "pve_create_network",
    {
      description: "Create a new network interface or bridge on a node",
      inputSchema: {
        ...nodeParam,
        iface: z.string().describe("Interface name"),
        type: z
          .enum(["bridge", "bond", "eth", "alias", "vlan", "OVSBridge", "OVSBond", "OVSPort", "OVSIntPort"])
          .describe("Interface type"),
        address: z.string().optional().describe("IPv4 address, e.g. 10.0.0.1"),
        netmask: z.string().optional().describe("Network mask, e.g. 255.255.255.0"),
        gateway: z.string().optional().describe("Default gateway address"),
        address6: z.string().optional().describe("IPv6 address"),
        netmask6: z.string().optional().describe("IPv6 prefix length"),
        gateway6: z.string().optional().describe("IPv6 default gateway"),
        bridge_ports: z.string().optional().describe("Bridge ports, e.g. eth0 eth1"),
        bridge_vlan_aware: z.boolean().optional().describe("Enable VLAN awareness on bridge"),
        bond_mode: z.string().optional().describe("Bond mode, e.g. balance-rr, active-backup, 802.3ad"),
        bond_primary: z.string().optional().describe("Primary interface for active-backup bond"),
        slaves: z.string().optional().describe("Bond slave interfaces, space-separated"),
        cidr: z.string().optional().describe("IPv4 CIDR notation, e.g. 10.0.0.1/24"),
        cidr6: z.string().optional().describe("IPv6 CIDR notation"),
        mtu: z.number().optional().describe("MTU value"),
        autostart: z.boolean().optional().describe("Auto-start interface at boot"),
        vlan_id: z.number().optional().describe("VLAN tag ID"),
        vlan_raw_device: z.string().optional().describe("VLAN raw device"),
        ovs_bridge: z.string().optional().describe("OVS bridge the port/interface belongs to"),
        ovs_bonds: z.string().optional().describe("OVS bond interfaces"),
        ovs_options: z.string().optional().describe("OVS additional options"),
        ovs_ports: z.string().optional().describe("OVS bridge ports"),
        ovs_tag: z.number().optional().describe("OVS VLAN tag"),
      },
    },
    async ({ node, iface, type, ...rest }) => {
      const body: Record<string, unknown> = { iface, type };
      for (const [k, v] of Object.entries(rest)) {
        if (v !== undefined) body[k] = v;
      }
      const data = await pvePost(`/nodes/${node}/network`, body);
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
        address: z.string().optional().describe("IPv4 address"),
        netmask: z.string().optional().describe("Network mask"),
        gateway: z.string().optional().describe("Default gateway"),
        address6: z.string().optional().describe("IPv6 address"),
        netmask6: z.string().optional().describe("IPv6 prefix length"),
        gateway6: z.string().optional().describe("IPv6 default gateway"),
        bridge_ports: z.string().optional().describe("Bridge ports"),
        bridge_vlan_aware: z.boolean().optional().describe("Enable VLAN awareness"),
        cidr: z.string().optional().describe("IPv4 CIDR notation"),
        cidr6: z.string().optional().describe("IPv6 CIDR notation"),
        mtu: z.number().optional().describe("MTU value"),
        autostart: z.boolean().optional().describe("Auto-start at boot"),
      },
    },
    async ({ node, iface, ...rest }) => {
      const body: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(rest)) {
        if (v !== undefined) body[k] = v;
      }
      const data = await pvePut(`/nodes/${node}/network/${iface}`, body);
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
