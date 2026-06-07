# Proxmox MCP Server Permissions

## Read-Only Mode Configuration

To run this MCP server in read-only mode, assign the API token to one of the following privilege profiles in Proxmox VE:

## Built-in Role (Recommended)
* **Role**: `PVEAuditor`
* **Path**: `/` (Propagate enabled)
* **Access**: Allows full read-only visibility into cluster resources, nodes, storage, VMs, and LXC containers.

## MCP Configuration
Ensure `PVE_READ_ONLY` is not set or set to `true` in your MCP server configuration:
```json
{
  "env": {
    "PVE_READ_ONLY": "true"
  }
}
```
