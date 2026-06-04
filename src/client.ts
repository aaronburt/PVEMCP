import https from "https";

const host = process.env.PVE_HOST ?? "";
const tokenId = process.env.PVE_TOKEN_ID ?? "";
const tokenSecret = process.env.PVE_TOKEN_SECRET ?? "";
const verifySSL = process.env.PVE_VERIFY_SSL !== "false";

if (!host || !tokenId || !tokenSecret) {
  process.stderr.write(
    "ERROR: PVE_HOST, PVE_TOKEN_ID, PVE_TOKEN_SECRET must be set\n"
  );
  process.exit(1);
}

const agent = new https.Agent({ rejectUnauthorized: verifySSL });

export const isReadOnly = process.env.PVE_READ_ONLY !== "false";

async function request<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  if (isReadOnly && method !== "GET") {
    throw new Error(`Write operations are blocked in read-only mode (${method} ${path})`);
  }

  const url = `${host}/api2/json${path}`;
  const headers: Record<string, string> = {
    Authorization: `PVEAPIToken=${tokenId}=${tokenSecret}`,
    Accept: "application/json",
  };

  const init: RequestInit & { agent?: https.Agent } = { method, headers, agent };

  if (body && Object.keys(body).length > 0) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url, init as RequestInit);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PVE API ${method} ${path} → ${res.status}: ${text}`);
  }

  const json = (await res.json()) as { data: T };
  return json.data;
}

export const pveGet = <T>(path: string) => request<T>("GET", path);
export const pvePost = <T>(path: string, body: Record<string, unknown> = {}) =>
  request<T>("POST", path, body);
export const pvePut = <T>(path: string, body: Record<string, unknown> = {}) =>
  request<T>("PUT", path, body);
export const pveDelete = <T>(path: string) => request<T>("DELETE", path);
