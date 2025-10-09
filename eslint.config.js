import pluginJs from '@eslint/js'
import globals from 'globals'
import path from 'path'
import tseslint from 'typescript-eslint'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default [
    {
        ignores: [
            '**/node_modules',
            '**/documentation',
            '**/out',
            '**/dist',
            '**/build',
            '**/.svelte-kit',
            '**/generated',
        ],
    },
    { files: ['**/*.{js,mjs,cjs,ts}'] },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                tsconfigRootDir: __dirname,
                noUnusedLocals: true,
                noUnusedParameters: true,
            },
        },
    },
]
