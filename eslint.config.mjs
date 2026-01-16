import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import parser from 'astro-eslint-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    'dist/**/*',
    'node_modules/**/*',
    '**/dist/',
    '**/.astro/',
    '**/node_modules/',
    '**/.tmp/',
    '**/*.generated.*',
    '**/*.min.*',
    '**/*.log',
    '**/npm-debug.log*',
    '**/yarn-debug.log*',
    '**/yarn-error.log*',
    '**/.env',
    '**/.env.*',
    '!**/.env.example',
    '.vscode/*',
    '!.vscode/extensions.json',
    '**/.idea',
    '**/.DS_Store',
    '**/*.suo',
    '**/*.ntvs*',
    '**/*.njsproj',
    '**/*.sln',
    '**/*.sw?',
    '**/package-lock.json',
    '**/yarn.lock',
    '**/pnpm-lock.yaml',
    '**/public/',
    'src/content/',
    'public/pagefind',
    'public/pagefind-blog',
    '**/pagefind/**',
    '**/pagefind-blog/**',
  ]),
  {
    extends: compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:astro/recommended',
      'plugin:jsx-a11y/recommended',
      'prettier'
    ),

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
  },
  {
    files: ['**/*.astro'],

    languageOptions: {
      parser: parser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
      },
    },

    rules: {
      'jsx-a11y/aria-activedescendant-has-tabindex': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/no-noninteractive-tabindex': 'off',
      'jsx-a11y/role-has-required-aria-props': 'off',
      'jsx-a11y/role-supports-aria-props': 'off',
      'jsx-a11y/tabindex-no-positive': 'off',
      'jsx-a11y/autocomplete-valid': 'off',
      'jsx-a11y/control-has-associated-label': 'off',
      'jsx-a11y/heading-has-content': 'off',
      'jsx-a11y/html-has-lang': 'off',
      'jsx-a11y/iframe-has-title': 'off',
      'jsx-a11y/img-redundant-alt': 'off',
      'jsx-a11y/interactive-supports-focus': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/label-has-for': 'off',
      'jsx-a11y/media-has-caption': 'off',
      'jsx-a11y/mouse-events-have-key-events': 'off',
      'jsx-a11y/no-autofocus': 'off',
      'jsx-a11y/no-distracting-elements': 'off',
      'jsx-a11y/no-interactive-element-to-noninteractive-role': 'off',
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'off',
      'jsx-a11y/no-redundant-roles': 'off',
      'jsx-a11y/scope': 'off',
      'jsx-a11y/no-access-key': 'off',
      'jsx-a11y/no-aria-hidden-on-focusable': 'off',
      'jsx-a11y/no-onchange': 'off',
      'jsx-a11y/alt-text': 'off',
      'jsx-a11y/anchor-has-content': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/aria-props': 'off',
      'jsx-a11y/aria-proptypes': 'off',
      'jsx-a11y/aria-unsupported-elements': 'off',
      'jsx-a11y/href-no-hash': 'off',
      'jsx-a11y/lang': 'off',
      'jsx-a11y/no-unescaped-entities': 'off',
    },
  },
  {
    files: ['**/*.mdx', '**/*.md'],

    extends: compat.extends('plugin:mdx/recommended'),

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    settings: {
      'mdx/code-blocks': true,
      'mdx/language-mapper': {},
    },

    rules: {
      'mdx/remark': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],

    extends: compat.extends(
      'plugin:@typescript-eslint/recommended',
      'plugin:jsx-a11y/recommended',
      'prettier'
    ),

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-array-constructor': 'error',
      'no-case-declarations': 'off',
      'no-empty': 'warn',
      'no-redeclare': 'off',
      'no-undef': 'off',
      'no-useless-escape': 'off',
      'no-constant-condition': 'off',
      'no-cond-assign': 'off',
      'no-control-regex': 'off',
      'no-prototype-builtins': 'off',
      'no-sparse-arrays': 'off',
      'no-unused-labels': 'off',
      'no-regex-spaces': 'off',
    },
  },
]);
