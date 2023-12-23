export type CDKContext = {
    appName: string;
    branchName: string;
};

export type LambdaEnv = {
    QUIZ_TABLE_NAME: string;
};