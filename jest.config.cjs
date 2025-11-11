// import type { Config } from "jest";
// const config: Config = {
//   preset: "ts-jest /presets/default-esm",
//   testEnvironment: "node",
//   verbose: true,
//   extensionsToTreatAsEsm: [".ts"],
//   moduleNameMapper: {
//     "^(\\.{1,2}/.*)\\.js$": "$1",
//   },
//   transform: {
//     "^.+\\.ts?$": [
//       "ts-jest",
//       {
//         useESM: true,
//         tsconfig: {
//           tsconfig: "tsconfig.jest.json",
//         },
//       },
//     ],
//   },
// };

// export default config;

/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },
};
