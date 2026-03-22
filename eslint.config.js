import { defineConfig } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfig([
  {
    name: 'global-ignores',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  {
    name: 'app/main-rules',
    files: ['**/*.{js,mjs,jsx,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          args: 'after-used',
        },
      ],
      'multiline-comment-style': ['error', 'starred-block'],
      'no-multi-str': 'error',
      'vue/html-comment-content-spacing': ['error', 'always'],
      'vue/html-comment-content-newline': [
        'error',
        {
          singleline: 'never',
          multiline: 'always',
        },
      ],
    },
  },

  skipFormatting,
])
