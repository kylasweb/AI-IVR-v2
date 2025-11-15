import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },

  // Memory optimization settings
  experimental: {
    // Disable webpack build worker to prevent chunk loading issues
    webpackBuildWorker: false,
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        radix: {
          test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
          name: 'radix-ui',
          chunks: 'all',
          priority: 20,
        },
        lucide: {
          test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
          name: 'lucide-react',
          chunks: 'all',
          priority: 20,
        },
      };
    }

    // Reduce memory usage in development
    if (dev) {
      // Enable webpack cache for faster rebuilds
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };

      // Optimize for development
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }

    // Bundle analyzer (only in production)
    if (!dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze/client.html',
        })
      );
    }

    return config;
  },

  // Output configuration for custom server
  output: 'standalone',

  // Performance optimizations
  images: {
    // Optimize image loading
    formats: ['image/webp', 'image/avif'],
  },

  // Reduce bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/{{member}}',
    },
    '@radix-ui/react-icons': {
      transform: 'lucide-react/{{member}}',
    },
  },

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
