import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    
    // 修复 Vercel 构建中的 webpack 错误
    webpack: (config, { dev, isServer }) => {
        // 检查是否在 Vercel 环境中
        const isVercel = process.env.VERCEL === '1';
        
        // 在生产环境中配置压缩策略
        if (!dev && !isServer) {
            if (isVercel) {
                // Vercel 环境中使用更保守的压缩配置
                config.optimization = {
                    ...config.optimization,
                    minimize: true,
                    minimizer: [
                        // 只使用 SWC minifier，避免使用可能有问题的 webpack minimizer
                        '...',
                    ],
                };
            } else {
                // 本地环境禁用压缩以加快构建速度
                config.optimization = {
                    ...config.optimization,
                    minimize: false,
                };
            }
        }
        
        return config;
    },

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
    
    // 输出配置 - 为了确保静态导出兼容性
    output: 'standalone',
};

export default nextConfig;
