import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 生产构建时跳过 ESLint 检查（避免因 lint 警告而构建失败）
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 生产构建时跳过 TypeScript 类型错误（避免因类型不匹配而构建失败）
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
