import * as cdk from 'aws-cdk-lib';
import { QuizardStack } from './stacks/quizardStack';
import gitBranch from 'git-branch';
import { CDKContext } from './shared/types';

const createStacks = async () => {
    try {
        const app = new cdk.App();
        const branchName = await gitBranch();
        const context: CDKContext = {
            appName: 'quizard',
            branchName
        }
        const stackProps: cdk.StackProps = {
            tags: {
                branch: branchName
            }
        };

        new QuizardStack(app, `${context.appName}-stack-${context.branchName}`, stackProps, context);

    } catch (error) {
        console.error(error);
    }
};

createStacks().catch(err => {
    console.error(err);
    process.exit(1);
});