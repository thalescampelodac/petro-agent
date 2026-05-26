import baseConfig from "./vitest.config";

const smokeConfig = {
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ["app/**/*.smoke.test.ts", "app/**/*.smoke.test.tsx"],
  },
};

export default smokeConfig;
