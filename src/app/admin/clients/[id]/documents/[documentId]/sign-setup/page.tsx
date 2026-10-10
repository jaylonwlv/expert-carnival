import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/documents";
import { PdfFieldEditor } from "@/components/PdfFieldEditor";
import { createSignatureRequest } from "../../../../../signature-actions";

export default async function SignSetupPage({
  params,
}: {
  params: Promise<{ id: string; documentId: string }>;
}) {
  const { id, documentId } = await params;

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { signatureRequest: true },
  });

  if (!document || document.clientId !== id) {
    notFound();
  }

  const fileUrl = await getSignedDownloadUrl(document.pathname);
  const sendAction = createSignatureRequest.bind(null, document.id);

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            href={`/admin/clients/${id}/documents`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-md px-2 py-1.5 -ml-2 hover:bg-stone-100 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
            Back to documents
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-stone-900">{document.filename}</h1>
          <p className="text-sm text-stone-500">
            Click a field type, then click on the document to place it. Drag to reposition.
          </p>
        </div>

        {document.signatureRequest ? (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
            <p className="text-sm text-stone-700">
              {document.signatureRequest.status === "signed"
                ? `Signed by ${document.signatureRequest.signedByName} on ${document.signatureRequest.signedAt?.toLocaleString()}.`
                : "A signature request has already been sent for this document."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
            <PdfFieldEditor fileUrl={fileUrl} onSend={sendAction} />
          </div>
        )}
      </main>
    </div>
  );
}
