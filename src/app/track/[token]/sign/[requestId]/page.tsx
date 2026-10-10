import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/documents";
import { SigningView } from "@/components/SigningView";
import type { SignatureFieldType } from "@/lib/signature";
import { submitSignature } from "../../../signature-actions";

export default async function SignPage({
  params,
}: {
  params: Promise<{ token: string; requestId: string }>;
}) {
  const { token, requestId } = await params;

  const request = await prisma.signatureRequest.findUnique({
    where: { id: requestId },
    include: { document: true, client: true, fields: { orderBy: { sortOrder: "asc" } } },
  });

  if (!request || request.client.token !== token) {
    notFound();
  }

  if (request.status === "pending") {
    await prisma.signatureRequest.update({ where: { id: requestId }, data: { status: "viewed", viewedAt: new Date() } });
  }

  const fileUrl = await getSignedDownloadUrl(request.document.pathname);
  const onSubmit = submitSignature.bind(null, requestId);

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-neutral-900">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href={`/track/${token}`} className="text-sm font-medium text-white/70 hover:text-white">
            ← Back
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">{request.document.filename}</h1>
          <p className="text-sm text-neutral-500">Review the document and fill in every highlighted field.</p>
        </div>

        {request.status === "signed" ? (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-2">
            <p className="text-sm font-medium text-emerald-700">
              You signed this document on {request.signedAt?.toLocaleString()}.
            </p>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-700 hover:underline">
              View the document
            </a>
          </div>
        ) : (
          <SigningView
            fileUrl={fileUrl}
            defaultSignerName={request.client.name}
            fields={request.fields.map((f) => ({
              id: f.id,
              type: f.type as SignatureFieldType,
              page: f.page,
              xPct: f.xPct,
              yPct: f.yPct,
              widthPct: f.widthPct,
              heightPct: f.heightPct,
              label: f.label,
            }))}
            onSubmit={onSubmit}
          />
        )}
      </main>
    </div>
  );
}
