import { headers } from "next/headers";

export async function buildTrackerUrl(token: string): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}/track/${token}`;
}
