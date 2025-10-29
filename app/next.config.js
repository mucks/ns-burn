/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable standalone output for Docker
    output: 'standalone',

    webpack: (config) => {
        // Fix for @solana/web3.js and other Node.js modules in Next.js
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            os: false,
            path: false,
            crypto: false,
        };
        return config;
    },
};

module.exports = nextConfig;

