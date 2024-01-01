import fs from 'fs';
import path from 'path';
import gitBranch from 'git-branch';

export const readCDKOutputsJSON = async (): Promise<CDKOutputJSON> => {
    const branchName = await gitBranch();
    const inputFile = path.resolve(`../../cdk-outputs/${branchName}.json`);
    const stackName = `quizard-stack-${branchName}`;
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const cdkOutput: { [K: string]: Record<string, string> } = JSON.parse(
            fs.readFileSync(inputFile, { encoding: 'utf-8' }),
        );

        const jsonData = cdkOutput[stackName];
        if (!jsonData) {
            throw Error('Data not found');
        }
        return jsonData as unknown as CDKOutputJSON;
    } catch {
        throw Error(
            `Unable to find ${stackName} in ${inputFile}. Please make sure stack name is correct. If you're checking out to a new branch, ` +
                `make sure you have npm run deploy the backend stack`,
        );
    }
};
