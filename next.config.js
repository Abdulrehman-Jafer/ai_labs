/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    experimental: {
        newNextLinkBehavior: false,
      },
    api: {
        //responseLimit: false,
        responseLimit: '4mb',
    },          
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "replicate.com",
        },
        {
          protocol: "https",
          hostname: "replicate.delivery",
        },
      ],
    },
  };

module.exports = nextConfig
