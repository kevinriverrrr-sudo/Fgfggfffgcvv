/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // Disable minification to avoid issues with background-removal library
  webpack: (config, { isServer }) => {
    // Ignore node-specific modules when bundling for the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }

    // Handle .node files
    config.module.rules.push({
      test: /\.node$/,
      use: 'null-loader',
    });

    // Handle WASM files and async modules
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Transpile the background removal package
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules\/@imgly\/background-removal/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
  transpilePackages: ['@imgly/background-removal'],
  experimental: {
    esmExternals: 'loose',
  },
}

module.exports = nextConfig
