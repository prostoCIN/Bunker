/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/supabase/:path*",
        destination: "https://xlqsgbtcsnnvcncxbusb.supabase.co/:path*",
      },
    ];
  },
};

export default nextConfig;
