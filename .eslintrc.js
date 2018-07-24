module.exports = {
  root: true,
  parser: 'babel-eslint',
  env: {
    browser: true,
    node: true
  },
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  rules: {
    // "semi": ["error","always"],//语句强制分号结尾
    "semi": 0, //禁止分号检测
  },
  globals: {
  }
}
