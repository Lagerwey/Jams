/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config: { resolve: any }) => {
        config.resolve = {
          ...config.resolve,
          fallback: {
            "fs": false,
            "path": false,
            "os": false,
            "dgram": false,
          }
        }
        return config
      },
}

module.exports = nextConfig

