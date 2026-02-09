"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [pdfUrl, setPdfUrl] = useState<string>("");

  useEffect(() => {
    // Append a timestamp to prevent caching
    setPdfUrl(`/api/pdf?t=${Date.now()}`);
  }, []);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="mb-4 text-2xl font-bold text-black">Resume</h1>
      <div className="h-[90vh] w-full max-w-5xl overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="h-full w-full"
            title="PDF Viewer"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <p>Loading PDF...</p>
          </div>
        )}
      </div>
    </div>
  );
}
