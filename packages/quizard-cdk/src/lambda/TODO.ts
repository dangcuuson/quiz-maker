import { AppSyncResolverHandler } from 'aws-lambda';

// this file is meant to tell us that there's some handler that need implmenetation
export const handler: AppSyncResolverHandler<unknown, unknown> = () => {
    throw Error(`Unimplemented`);
};