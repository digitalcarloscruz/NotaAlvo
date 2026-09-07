import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  async redirects() {
    return [
      { source: "/:path*", has: [{ type: "host", value: "notaalvo.com.br" }], destination: "https://www.notaalvo.com.br/:path*", permanent: false },
      { source: "/", has: [{ type: "host", value: "app.notaalvo.com.br" }], destination: "/app", permanent: false },
      { source: "/resultadodoquiz", has: [{ type: "host", value: "app.notaalvo.com.br" }], destination: "https://www.notaalvo.com.br/resultadodoquiz", permanent: false },
    ];
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
