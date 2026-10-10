import * as pdfjsLib from "pdfjs-dist";

// Self-hosted (copied from node_modules/pdfjs-dist/build at install time) so
// rendering doesn't depend on a third-party CDN being reachable. Must be
// re-copied to public/pdf.worker.min.mjs if pdfjs-dist is ever upgraded.
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export { pdfjsLib };
