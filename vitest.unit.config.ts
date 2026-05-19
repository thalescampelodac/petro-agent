import baseConfig from "./vitest.config";

const unitConfig = {
  ...baseConfig,
  test: {
    globals: true,
    environment: "node",
    include: [
      "lib/**/*.unit.test.ts",
      "lib/**/*.unit.test.tsx",
      "services/**/*.unit.test.ts",
      "services/**/*.unit.test.tsx",
    ],
  },
};

export default unitConfig;
