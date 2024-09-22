import pluginJs from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
    { ignores: ['**/node_modules', '**/documentation'] },
    { files: ['**/*.{js,mjs,cjs,ts}'] },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                project: '**/tsconfig.json',
                tsconfigRootDir: './',
                noUnusedLocals: true,
                noUnusedParameters: true,
            },
        },
    },
]
