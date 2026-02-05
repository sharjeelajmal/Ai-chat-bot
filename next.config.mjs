/** @type {import('next').NextConfig} */
const nextConfig = {
    // 1. Xenova (Local AI) ko server components se bahar rakho
    serverExternalPackages: ['@xenova/transformers'],

    // 2. Webpack ki setting (Binary files fix karne ke liye)
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            'sharp$': false,
            'onnxruntime-node$': false,
        };
        return config;
    },

    // 3. NEW FIX: Turbopack ko shant karne ke liye khali object
    turbopack: {}, 
};

export default nextConfig;