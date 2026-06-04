import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerClusterTools } from "./tools/cluster.js";
import { registerNodeTools } from "./tools/nodes.js";
import { registerQemuTools } from "./tools/qemu.js";
import { registerLxcTools } from "./tools/lxc.js";
import { registerStorageTools } from "./tools/storage.js";
import { registerNetworkTools } from "./tools/network.js";
import { registerAccessTools } from "./tools/access.js";

const server = new McpServer({
  name: "proxmox-mcp",
  version: "1.0.0",
});

registerClusterTools(server);
registerNodeTools(server);
registerQemuTools(server);
registerLxcTools(server);
registerStorageTools(server);
registerNetworkTools(server);
registerAccessTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write("Proxmox MCP server running on stdio\n");
