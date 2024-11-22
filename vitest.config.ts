import tsconfigPaths from 'vite-tsconfig-paths'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        coverage: {
            provider: 'v8',
            exclude: ['./docs/**'],
        },
        exclude: [...configDefaults.exclude, './docs/**'],
    },
})
