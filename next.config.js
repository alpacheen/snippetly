// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     experimental: {
//       optimizeCss: true,
//     },
//     images: {
//       remotePatterns: [
//         {
//           protocol: 'https',
//           hostname: 'avatars.githubusercontent.com',
//         },
//         {
//           protocol: 'https',
//           hostname: 'lh3.googleusercontent.com',
//         },
//         {
//           protocol: 'https',
//           hostname: 'images.unsplash.com',
//         },
//         {
//           protocol: 'https',
//           hostname: 'img.freepik.com',
//         },
//         {
//           protocol: 'https',
//           hostname: 'via.placeholder.com',
//         },
//         {
//           protocol: 'https',
//           hostname: 'picsum.photos',
//         },
//         {
//           protocol: 'https',
//           hostname: 'imgur.com',
//         },
//         {
//           protocol: 'https',
//           hostname: 'i.imgur.com',
//         },
//       ],
//     },
//     // Fix server-side issues
//     webpack: (config, { isServer }) => {
//       if (!isServer) {
//         // Fix 'self is not defined' error
//         config.resolve.fallback = {
//           ...config.resolve.fallback,
//           fs: false,
//           net: false,
//           tls: false,
//         };
//       }
      
//       // Optimize bundle
//       config.optimization.splitChunks = {
//         chunks: 'all',
//         cacheGroups: {
//           vendor: {
//             test: /[\\/]node_modules[\\/]/,
//             name: 'vendors',
//             priority: 10,
//             enforce: true,
//           },
//         },
//       };
      
//       return config;
//     },
//   };
  
//   module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable experimental features for performance
    experimental: {
      optimizeCss: true,
      optimizeServerReact: true,
      scrollRestoration: true,
    },
  
    // Image optimization
    images: {
      formats: ['image/webp', 'image/avif'],
      minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
      dangerouslyAllowSVG: true,
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'avatars.githubusercontent.com',
        },
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
        },
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
        {
          protocol: 'https',
          hostname: 'img.freepik.com',
        },
        {
          protocol: 'https',
          hostname: 'via.placeholder.com',
        },
        {
          protocol: 'https',
          hostname: 'picsum.photos',
        },
        {
          protocol: 'https',
          hostname: 'imgur.com',
        },
        {
          protocol: 'https',
          hostname: 'i.imgur.com',
        },
      ],
    },
  
    // Compiler optimizations
    compiler: {
      // Remove console logs in production
      removeConsole: process.env.NODE_ENV === 'production' ? {
        exclude: ['error', 'warn'],
      } : false,
    },
  
    // Performance optimizations
    webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
      if (!isServer) {
        // Fix 'self is not defined' error
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
          crypto: false,
        };
      }
      
      // Bundle optimization
      if (!dev) {
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              enforce: true,
            },
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        };
  
        // Minimize bundle size
        config.optimization.usedExports = true;
        config.optimization.sideEffects = false;
      }
  
      // Add bundle analyzer in analyze mode
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-analysis.html',
          })
        );
      }
      
      return config;
    },
  
    // Headers for security and performance
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on'
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload'
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block'
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY'
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'Referrer-Policy',
              value: 'origin-when-cross-origin'
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=()'
            }
          ],
        },
        {
          source: '/api/:path*',
          headers: [
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_BASE_URL || '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
            { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
          ]
        }
      ]
    },
  
    // Redirects for better SEO
    async redirects() {
      return [
        {
          source: '/home',
          destination: '/',
          permanent: true,
        },
        {
          source: '/snippet/:id',
          destination: '/snippets/:id',
          permanent: true,
        },
      ];
    },
  
    // Enable static generation for better performance
    output: 'standalone',
    
    // TypeScript configuration
    typescript: {
      ignoreBuildErrors: false,
    },
  
    // ESLint configuration
    eslint: {
      ignoreDuringBuilds: false,
    },
  
    // Enable source maps in production for debugging
    productionBrowserSourceMaps: false,
  
    // Compress images
    compress: true,

    // PoweredBy header
    poweredByHeader: false,
  
    // React strict mode for better development experience
    reactStrictMode: true,
  };
  
  module.exports = nextConfig;