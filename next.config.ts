import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    
    // 修复 Vercel 构建中的 webpack 错误 - 终极解决方案
    webpack: (config, { dev, isServer, webpack }) => {
        // 检查是否在 Vercel 环境中
        const isVercel = process.env.VERCEL === '1';
        
        // 在生产环境中配置压缩策略
        if (!dev && !isServer) {
            if (isVercel) {
                // Vercel 环境中完全重写优化配置，避免 webpack 构造函数错误
                config.optimization = {
                    ...config.optimization,
                    minimize: false, // 完全禁用压缩
                    minimizer: [], // 清空所有压缩器
                    splitChunks: false, // 禁用代码分割
                    runtimeChunk: false, // 禁用运行时代码分割
                    sideEffects: false, // 禁用副作用检测
                    usedExports: false, // 禁用 tree shaking
                    concatenateModules: false, // 禁用模块连接
                    mangleExports: false, // 禁用导出名称压缩
                };
                
                // 完全清空插件列表中的压缩相关插件
                if (config.plugins) {
                    config.plugins = config.plugins.filter((plugin: any) => {
                        if (!plugin || !plugin.constructor) return true;
                        const pluginName = plugin.constructor.name || '';
                        const isMinifyPlugin = pluginName.includes('Minify') || 
                                             pluginName.includes('TerserPlugin') ||
                                             pluginName.includes('CompressionPlugin') ||
                                             pluginName.includes('OptimizeCssAssetsPlugin') ||
                                             pluginName.includes('CssMinimizerPlugin');
                        return !isMinifyPlugin;
                    });
                }
                
                // 添加自定义插件来替代有问题的 webpack 插件
                config.plugins = config.plugins || [];
                
                // 确保 webpack 版本兼容性
                if (webpack && webpack.DefinePlugin) {
                    config.plugins.push(new webpack.DefinePlugin({
                        'process.env.WEBPACK_MINIFY_DISABLED': JSON.stringify('true'),
                    }));
                }
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
        // 强制禁用 webpack 压缩
        DISABLE_WEBPACK_MINIFY: '1',
    },
    
    // 服务器外部包配置
    serverExternalPackages: ['undici'],
    
    // 输出配置 - 为了确保静态导出兼容性
    output: 'standalone',
};

export default nextConfig;
