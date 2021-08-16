// http://eslint.org/docs/user-guide/configuring

module.exports = {
  globals: {
    memory: 'readonly',
    base: 'readonly',
    enemy_base: 'readonly',
    star_zxq: 'readonly',
    star_a1c: 'readonly',
    star_p89: 'readonly',
    outpost: 'readonly',
    my_spirits: 'readonly',
    spirits: 'readonly',
    tick: 'readonly',
  },
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  extends: 'standard',
  'rules': {
    'no-console': 1,
    'arrow-parens': 0,
    'no-unused-vars': 1,
    'comma-dangle': [ 'error', 'always-multiline' ]
  }
}
