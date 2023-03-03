/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    config.module.rules.push({
      test: /\.(html)$/,
      use: {
        loader: "html-loader",
      },
    });

    // Important: return the modified config
    return config;
  },
};
