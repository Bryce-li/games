import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    turbopack: {
        resolveAlias: {
            // 解决 Turbopack 字体模块解析问题
            '@vercel/turbopack-next/internal/font/google/font': 'next/font/google',
        },
    },
    images: {
        unoptimized: true,
        domains: [
            "source.unsplash.com",
            "images.unsplash.com",
            "ext.same-assets.com",
            "ugc.same-assets.com",
        ],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "source.unsplash.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "ext.same-assets.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "ugc.same-assets.com",
                pathname: "/**",
            },
        ],
    },
    // 环境变量配置
    env: {
        // 支持代理配置
        HTTP_PROXY: process.env.HTTP_PROXY || '',
        HTTPS_PROXY: process.env.HTTPS_PROXY || '',
        NO_PROXY: process.env.NO_PROXY || '',
    },
    // 服务器外部包配置
    serverExternalPackages: ['undici'],
};

export default nextConfig;
