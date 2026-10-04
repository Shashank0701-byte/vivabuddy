import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pdf-parse"],
  outputFileTracingIncludes: {
    "/api/documents": ["./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"],
  },
  turbopack: { root: process.cwd() },
};

export default nextConfig;
