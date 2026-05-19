import baseConfig from "./vitest.config";

const contextConfig = {
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ["app/**/*.context.test.ts", "app/**/*.context.test.tsx"],
  },
};

export default contextConfig;
