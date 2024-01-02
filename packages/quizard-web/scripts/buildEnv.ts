import fs from 'fs';
import path from 'path';
import { readCDKOutputsJSON } from './readCDKOutputsJson';

const start = async () => {
    const cdkOutputs = await readCDKOutputsJSON() as unknown as Record<string, string>;
    const lines = Object.keys(cdkOutputs)
        .map(key => {
            return `VITE_${key}=${cdkOutputs[key]}`
        })
        .join('\n');

    const outputFile = path.resolve('.env');
    fs.writeFileSync(outputFile, lines, 'utf-8');
};

start().catch((err) => {
    console.error(err);
    process.exit(1);
});
