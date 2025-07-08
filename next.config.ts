import type { NextConfig } from "next";
import dotenv from 'dotenv';

dotenv.config();

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Add client-side specific configuration
    if (!isServer) {
      // Ignore Node.js specific modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        dns: false,
        fs: false,
        child_process: false,
      };
    }
    
    // Existing JSON rule
    config.module.rules.push({
      test: /\.json$/,
      type: 'json'
    });
    
    return config;
  }
};

export default nextConfig;
