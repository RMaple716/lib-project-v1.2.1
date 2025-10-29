module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential'
    // 移除了 '@vue/standard' - 这样就不会检查空格和分号了
  ],
  parserOptions: {
    requireConfigFile: false,
    parser: '@babel/eslint-parser'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}
