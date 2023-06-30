module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-turbo`
  extends: ["@trpc-turbo/eslint-config-turbo"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
};
