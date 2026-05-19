import baseConfig from "./vitest.config";

const unitConfig = {
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ["lib/**/*.unit.test.ts", "lib/**/*.unit.test.tsx"],
  },
};

export default unitConfig;
