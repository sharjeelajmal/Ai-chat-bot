/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ye setting Vercel ko batati hai ke Xenova library ko mat chhero
    serverExternalPackages: ['@xenova/transformers'],
};

export default nextConfig;