import fs from 'fs';
import path from 'path';

const inputFile = path.resolve('../../cdk-outputs.json');

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const cdkJsonOutput: { [K: string]: Record<string, string> } = JSON.parse(
    fs.readFileSync(inputFile, { encoding: 'utf-8' }),
);

const keys = Object.keys(cdkJsonOutput);
if (keys.length > 1) {
    throw Error(`Found multiple stacks`);
}
if (keys.length === 0) {
    throw Error(`No stack found`);
}

const jsonData = cdkJsonOutput[keys[0]];
const lines = Object.keys(jsonData)
    .map((key) => {
        return `VITE_${key}=${jsonData[key]}`;
    })
    .join('\n');

const outputFile = path.resolve('.env');
fs.writeFileSync(outputFile, lines, 'utf-8');