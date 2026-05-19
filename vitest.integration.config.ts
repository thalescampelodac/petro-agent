import baseConfig from "./vitest.config";

const integrationConfig = {
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: [
      "components/**/*.integration.test.ts",
      "components/**/*.integration.test.tsx",
    ],
  },
};

export default integrationConfig;
