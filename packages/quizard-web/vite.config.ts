import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    envDir: path.resolve('./'),
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    lodash: ['lodash'],
                    React: ['react'],
                    'aws-amplify-ui': ['@aws-amplify/ui'],
                    'aws-amplify-ui-react': ['@aws-amplify/ui-react'],
                    'styled-components': ['styled-components'],
                    'react-router': ['react-router', 'react-router-dom'],
                    'apollo-client': ['@apollo/client']
                },
            },
        },
    },
    resolve: {
        // path mapping. Need to repeat this config in tsconfig.json aswell
        alias: [
            {
                find: '@gql',
                replacement: path.resolve(__dirname, 'src/gql'),
            },
            {
                find: '@components',
                replacement: path.resolve(__dirname, 'src/components'),
            },
            {
                find: '@pages',
                replacement: path.resolve(__dirname, 'src/pages'),
            },
            {
                find: '@hooks',
                replacement: path.resolve(__dirname, 'src/hooks'),
            },
            {
                find: '@utils',
                replacement: path.resolve(__dirname, 'src/utils'),
            },
            {
                find: '@config',
                replacement: path.resolve(__dirname, 'src/config'),
            },
        ],
    },
});
