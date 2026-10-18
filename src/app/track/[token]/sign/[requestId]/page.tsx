import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/documents";
import { SigningView } from "@/components/SigningView";
import { IdentityAcknowledgment } from "@/components/IdentityAcknowledgment";
import type { SignatureFieldType } from "@/lib/signature";
import { submitSignature, acknowledgeIdentity } from "../../../signature-actions";

const AGENT_NAME = process.env.NEXT_PUBLIC_AGENT_NAME ?? "your agent";

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

  const onSubmit = submitSignature.bind(null, requestId, token);
  const onAcknowledge = acknowledgeIdentity.bind(null, requestId, token);

  const needsIdAcknowledgment =
    request.status !== "signed" && request.requiresIdAcknowledgment && !request.idAcknowledgedAt;

  // The acknowledgment gate doesn't show the PDF at all, so there's no reason
  // to pay for a signed-URL round trip to Vercel Blob before the client even
  // gets past it. Once signed, the document to show is the stamped copy
  // (their signature baked in, plus the audit page) -- not the original,
  // pre-signature source file that request.document still points at.
  let viewUrl: string | null = null;
  // Documents aren't protected from deletion once they're the target of a
  // signedDocumentId reference, so that lookup can come back empty (e.g. an
  // admin cleaning up the gallery deletes what looks like a stray file but
  // is actually the signed copy). Falling back to the unsigned original in
  // that case would silently show the wrong document under a "you signed
  // this" banner -- surfacing it as missing instead is the honest result.
  let signedCopyMissing = false;
  if (!needsIdAcknowledgment) {
    if (request.status === "signed") {
      const signedDocument = request.signedDocumentId
        ? await prisma.document.findUnique({ where: { id: request.signedDocumentId } })
        : null;
      if (signedDocument) {
        viewUrl = await getSignedDownloadUrl(signedDocument.pathname);
      } else {
        signedCopyMissing = true;
      }
    } else {
      viewUrl = await getSignedDownloadUrl(request.document.pathname);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Image src="/logo.png" alt="Relocation Engine LLC" width={680} height={546} className="h-16 w-auto" priority />
          <Link href={`/track/${token}`} className="text-sm font-medium text-stone-500 hover:text-stone-800 transition">
            ← Back
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-stone-900">{request.document.filename}</h1>
          <p className="text-sm text-stone-500">Review the document and fill in every highlighted field.</p>
        </div>

        {request.status === "signed" ? (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-2">
            <p className="text-sm font-medium text-emerald-700">
              You signed this document on {request.signedAt?.toLocaleString()}.
            </p>
            {signedCopyMissing ? (
              <p className="text-sm text-red-600">
                Your signed copy couldn&apos;t be found. Please contact {AGENT_NAME} so they can send you another
                copy.
              </p>
            ) : (
              // viewUrl is always resolved here: this branch only runs when
              // needsIdAcknowledgment is false and signedCopyMissing is
              // false, which is what gates whether viewUrl gets computed
              // above.
              <a href={viewUrl!} target="_blank" rel="noopener noreferrer" className="text-sm text-stone-700 hover:underline">
                View the document
              </a>
            )}
          </div>
        ) : needsIdAcknowledgment ? (
          <IdentityAcknowledgment documentFilename={request.document.filename} onAcknowledge={onAcknowledge} />
        ) : (
          <SigningView
            fileUrl={viewUrl!}
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
