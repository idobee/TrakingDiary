/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'drive.google.com', 'lh3.googleusercontent.com'],
  },
  webpack: (config) => {
    config.cache = false;
    return config;
  },
}

module.exports = nextConfig
