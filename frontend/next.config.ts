import type { NextConfig } from "next";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ⬅ ignora erros de ESLint durante o build
  },
  typescript: {
    ignoreBuildErrors: true, // ⬅ ignora erros de TS no deploy
  },
};

module.exports = nextConfig;
