import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'lh3.googleusercontent.com', // For Google profile pictures
      'firebasestorage.googleapis.com', // For Firebase Storage images
      'res.cloudinary.com'
    ],
  },
};

export default nextConfig;
