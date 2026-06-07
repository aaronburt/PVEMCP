import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { isReadOnly } from "./client.js";
import { registerReadAccessTools } from "./tools/read/access.js";
import { registerReadClusterTools } from "./tools/read/cluster.js";
import { registerReadLxcTools } from "./tools/read/lxc.js";
import { registerReadNetworkTools } from "./tools/read/network.js";
import { registerReadNodeTools } from "./tools/read/nodes.js";
import { registerReadQemuTools } from "./tools/read/qemu.js";
import { registerReadStorageTools } from "./tools/read/storage.js";
import { registerWriteAccessTools } from "./tools/write/access.js";
import { registerWriteLxcTools } from "./tools/write/lxc.js";
import { registerWriteNetworkTools } from "./tools/write/network.js";
import { registerWriteNodeTools } from "./tools/write/nodes.js";
import { registerWriteQemuTools } from "./tools/write/qemu.js";
import { registerWriteStorageTools } from "./tools/write/storage.js";

const server = new McpServer({
  name: "proxmox-mcp",
  version: "1.0.0",
});

const readRegistrars = [
  registerReadAccessTools,
  registerReadClusterTools,
  registerReadLxcTools,
  registerReadNetworkTools,
  registerReadNodeTools,
  registerReadQemuTools,
  registerReadStorageTools,
];

const writeRegistrars = [
  registerWriteAccessTools,
  registerWriteLxcTools,
  registerWriteNetworkTools,
  registerWriteNodeTools,
  registerWriteQemuTools,
  registerWriteStorageTools,
];

for (const register of readRegistrars) {
  register(server);
}

if (!isReadOnly) {
  for (const register of writeRegistrars) {
    register(server);
  }
}


const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write("Proxmox MCP server running on stdio\n");
