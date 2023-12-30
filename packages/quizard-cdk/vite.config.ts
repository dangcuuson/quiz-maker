import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

function recursiveSearchFile(basePath: string, filterRegex: RegExp, fileNames: string[] = []) {
    const fileStat = fs.statSync(basePath);
    if (fileStat.isDirectory()) {
        const directory = fs.readdirSync(basePath);
        directory.forEach((f) => recursiveSearchFile(path.join(basePath, f), filterRegex, fileNames));
    } else if (filterRegex.test(basePath)) {
        fileNames.push(basePath);
    }
    return fileNames;
}

// this list contain absolute path
const absoluteFiles = recursiveSearchFile(path.resolve('src/lambda'), /\.ts$/);

// convert absolute path to relative paths
const relativeFiles = absoluteFiles.map(fileName => {
    return fileName.replace(`${path.resolve()}/`, '');
});
const inputMap = relativeFiles.reduce<Record<string, string>>(
    (acc, curPath) => {
        const outputKey = curPath.replace('src/', '').replace(/\.ts$/, '');
        acc[outputKey] = curPath;
        return acc;
    },
    {}
);

// https://vitejs.dev/config/
export default defineConfig({
    // base: '/quizard/',
    // plugins: [react()],
    // envDir: path.resolve('./'),
    build: {
        rollupOptions: {
            input: inputMap,
            output: {
                entryFileNames: '[name].js'
            },
        },
    },
    resolve: {
        // path mapping. Need to repeat this config in tsconfig.json aswell
        alias: [
            {
                find: '/opt',
                replacement: path.resolve(__dirname, 'src/shared'),
            },
        ],
    },
});
