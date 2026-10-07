import { issueSignedToken, presignUrl } from "@vercel/blob";

export async function getSignedDownloadUrl(pathname: string): Promise<string> {
  const signedToken = await issueSignedToken({
    pathname,
    operations: ["get"],
  });

  const { presignedUrl } = await presignUrl(signedToken, {
    operation: "get",
    pathname,
    access: "private",
  });

  return presignedUrl;
}
