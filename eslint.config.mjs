import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import pluginJs from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const autoImportPath = path.resolve(__dirname, '.auto-import.json')
const autoImportConfig = fs.existsSync(autoImportPath)
  ? JSON.parse(fs.readFileSync(autoImportPath, 'utf-8'))
  : { globals: {} }

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,vue}']
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,vue}'],

    languageOptions: {
      globals: {
        ...autoImportConfig.globals,
        Api: 'readonly',
        ElMessage: 'readonly',
        ElNotification: 'readonly'
      }
    },
    rules: {
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'no-var': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/multi-word-component-names': 'off',
      'no-multiple-empty-lines': ['warn', { max: 1 }],
      'no-unexpected-multiline': 'error',
      'no-dupe-keys': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ]
    }
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser }
    }
  },
  {
    ignores: [
      'node_modules',
      'dist',
      'public',
      '.vscode/**',
      'src/assets/**',
      'src/utils/console.ts',
      'scratch/**'
    ]
  },
  eslintPluginPrettierRecommended
]
