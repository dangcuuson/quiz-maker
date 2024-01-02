import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    base: process.env.WEB_BASE_URL || '/',
    plugins: [react()],
    envDir: path.resolve('./'),
    build: {
        rollupOptions: {
            input: {
                'main': 'index.html',
                '404': '404.html',
            },
            output: {
                manualChunks: {
                    lodash: ['lodash'],
                    React: ['react'],
                    'aws-amplify-ui': ['@aws-amplify/ui'],
                    'aws-amplify-ui-react': ['@aws-amplify/ui-react'],
                    'styled-components': ['styled-components'],
                    'react-router': ['react-router', 'react-router-dom'],
                    'apollo-client': ['@apollo/client'],
                },
            },
        },
    },
    resolve: {
        // path mapping. Need to repeat this config in tsconfig.json aswell
        alias: [
            {
                find: '@gql',
                replacement: path.resolve('src/gql'),
            },
            {
                find: '@components',
                replacement: path.resolve('src/components'),
            },
            {
                find: '@pages',
                replacement: path.resolve('src/pages'),
            },
            {
                find: '@hooks',
                replacement: path.resolve('src/hooks'),
            },
            {
                find: '@utils',
                replacement: path.resolve('src/utils'),
            },
            {
                find: '@config',
                replacement: path.resolve('src/config'),
            },
        ],
    },
});
