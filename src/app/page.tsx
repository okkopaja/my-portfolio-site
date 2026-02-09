"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import react-pdf to avoid SSR issues
const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false }
);

const Page = dynamic(
  () => import("react-pdf").then((mod) => mod.Page),
  { ssr: false }
);

export default function Home() {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Configure PDF.js worker
    import("react-pdf").then((pdfjs) => {
      pdfjs.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.pdfjs.version}/build/pdf.worker.min.mjs`;
    });

    // Append a timestamp to prevent caching
    setPdfUrl(`/api/pdf?t=${Date.now()}`);

    // Set initial width based on screen size
    const updateWidth = () => {
      const container = document.getElementById("pdf-container");
      if (container) {
        setPageWidth(container.offsetWidth - 32); // Subtract padding
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  if (!isClient) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600 mx-auto"></div>
          <p className="text-slate-600">Loading viewer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-5xl py-6">
        <h1 className="mb-6 text-center text-3xl font-bold text-slate-800">
          Resume
        </h1>

        <div
          id="pdf-container"
          className="overflow-auto rounded-xl border border-slate-300 bg-white shadow-2xl"
          style={{ maxHeight: "85vh" }}
        >
          {pdfUrl ? (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex h-96 items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600 mx-auto"></div>
                    <p className="text-slate-600">Loading PDF...</p>
                  </div>
                </div>
              }
              error={
                <div className="flex h-96 items-center justify-center">
                  <p className="text-red-600">Failed to load PDF. Please try again.</p>
                </div>
              }
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={pageWidth || undefined}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="mb-4"
                />
              ))}
            </Document>
          ) : (
            <div className="flex h-96 items-center justify-center">
              <p className="text-slate-600">Initializing viewer...</p>
            </div>
          )}
        </div>

        {numPages > 0 && (
          <p className="mt-4 text-center text-sm text-slate-600">
            Total pages: {numPages}
          </p>
        )}
      </div>
    </div>
  );
}
