import { pveGet } from "./client.js";

async function runTests() {
  try {
    console.log("Testing cluster status...");
    const clusterStatus = await pveGet("/cluster/status");
    console.log("Cluster Status:", JSON.stringify(clusterStatus, null, 2));

    console.log("Testing cluster resources...");
    const resources = await pveGet("/cluster/resources");
    console.log("Resources Count:", (resources as any[]).length);

    console.log("Testing cluster tasks...");
    const tasks = await pveGet("/cluster/tasks");
    console.log("Tasks Count:", (tasks as any[]).length);

    console.log("Testing nodes list...");
    const nodes = await pveGet<any[]>("/nodes");
    console.log("Nodes:", nodes.map((n: any) => n.node));

    for (const node of nodes) {
      console.log(`Testing node status for ${node.node}...`);
      const nodeStatus = await pveGet(`/nodes/${node.node}/status`);
      console.log(`Node ${node.node} Status:`, JSON.stringify(nodeStatus, null, 2));

      console.log(`Testing node storage status for ${node.node}...`);
      const storage = await pveGet(`/nodes/${node.node}/storage`);
      console.log(`Node ${node.node} Storage Count:`, (storage as any[]).length);

      console.log(`Testing containers list for ${node.node}...`);
      const containers = await pveGet(`/nodes/${node.node}/lxc`);
      console.log(`Node ${node.node} Containers Count:`, (containers as any[]).length);

      console.log(`Testing VMs list for ${node.node}...`);
      const vms = await pveGet(`/nodes/${node.node}/qemu`);
      console.log(`Node ${node.node} VMs Count:`, (vms as any[]).length);

      console.log(`Testing network list for ${node.node}...`);
      const network = await pveGet(`/nodes/${node.node}/network`);
      console.log(`Node ${node.node} Network Count:`, (network as any[]).length);
    }

    console.log("Testing users list...");
    const users = await pveGet("/access/users");
    console.log("Users Count:", (users as any[]).length);

    console.log("Testing roles list...");
    const roles = await pveGet("/access/roles");
    console.log("Roles Count:", (roles as any[]).length);

    console.log("Testing ACLs list...");
    const acls = await pveGet("/access/acl");
    console.log("ACLs Count:", (acls as any[]).length);

    console.log("All tests passed successfully.");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

runTests();
