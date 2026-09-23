import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // the game used to live at /play; the landing page is the game now
  redirects: async () => [{ source: "/play", destination: "/", permanent: true }],
};

export default nextConfig;

initOpenNextCloudflareForDev();
