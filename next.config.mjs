/** @type {import('next').NextConfig} */
const nextConfig = {
    // 1. Xenova ko bundle hone se rokein
    serverExternalPackages: ['@xenova/transformers'],

    // 2. Binary files (ONNX) ko sahi tarah handle karein
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            'sharp$': false,
            'onnxruntime-node$': false,
        };
        return config;
    },
};

export default nextConfig;