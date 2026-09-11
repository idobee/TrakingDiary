/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // Windows 환경 파일 잠금 방지
  images: {
    domains: ['images.unsplash.com', 'drive.google.com', 'lh3.googleusercontent.com'],
  },
}

module.exports = nextConfig
