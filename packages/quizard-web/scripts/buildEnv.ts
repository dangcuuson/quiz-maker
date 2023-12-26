import fs from 'fs';
import path from 'path';
import gitBranch from 'git-branch';

const start = async () => {
    const branchName = await gitBranch();
    const inputFile = path.resolve('../../cdk-outputs.json');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const cdkOutput: { [K: string]: Record<string, string> }
        = JSON.parse(fs.readFileSync(inputFile, { encoding: 'utf-8' }));
    const stackName = `quizard-stack-${branchName}`;
    const jsonData = cdkOutput[stackName];
    if (!jsonData) {
        throw Error(
            `Unable to find ${stackName} in ${inputFile}. Please make sure stack name is correct. If you're checking out to a new branch, ` +
            `make sure you have npm run deploy the backend stack`
        );
    }

    const lines = Object.keys(jsonData)
        .map(key => {
            return `VITE_${key}=${jsonData[key]}`
        })
        .join('\n');

    const outputFile = path.resolve('.env');
    fs.writeFileSync(outputFile, lines, 'utf-8');
}

start().catch(err => {
    console.error(err);
    process.exit(1);
})