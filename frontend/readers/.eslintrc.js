module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
    // Allow @babel/eslint-parser to work even if the editor doesn't load
    // the project's Babel config (prevents "No Babel config file detected").
    requireConfigFile: false,
    // Ensure parsing matches Vue CLI babel preset when available.
    // This only applies when the parser runs; it won't modify your build.
    babelOptions: {
      presets: ['@vue/cli-plugin-babel/preset']
    }
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}
