import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/documents";
import { DocumentGallery } from "@/components/DocumentGallery";
import { deleteDocument, toggleDocumentVisibility } from "../../../actions";

export default async function ClientDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      documents: {
        orderBy: { createdAt: "desc" },
        include: { signatureRequest: true },
      },
    },
  });

  if (!client) {
    notFound();
  }

  const documents = await Promise.all(
    client.documents.map(async (doc) => ({
      ...doc,
      downloadUrl: await getSignedDownloadUrl(doc.pathname),
    }))
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link
            href={`/admin/clients/${client.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-md px-2 py-1.5 -ml-2 hover:bg-stone-100 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
            Back to {client.name}
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-stone-900">{client.name}&apos;s documents</h1>
          <p className="text-sm text-stone-500">
            {documents.length} {documents.length === 1 ? "document" : "documents"}
          </p>
        </div>

        <DocumentGallery
          documents={documents}
          clientId={client.id}
          deleteAction={deleteDocument}
          toggleAction={toggleDocumentVisibility}
        />
      </main>
    </div>
  );
}
