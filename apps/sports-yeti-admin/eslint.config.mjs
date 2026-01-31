import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['!**/*', 'node_modules/**/*'],
  },
];
