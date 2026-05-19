import baseConfig from "./vitest.config";

const integrationConfig = {
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: [
      "app/**/*.integration.test.ts",
      "app/**/*.integration.test.tsx",
      "components/**/*.integration.test.ts",
      "components/**/*.integration.test.tsx",
    ],
  },
};

export default integrationConfig;
