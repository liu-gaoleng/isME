import type { NextConfig } from "next";

// Next.js 16 已移除内置 next.config 中的 eslint 选项；ESLint 现在以独立 flat config 运行。
// TS 类型错误必须暴露——任何类型错误都应被构建发现并修复（不再设置 typescript.ignoreBuildErrors）。
const nextConfig: NextConfig = {};

export default nextConfig;
