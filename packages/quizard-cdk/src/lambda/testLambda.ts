import { AppSyncResolverHandler } from 'aws-lambda';
import { GQLQuery } from '/opt/gqlTypes';

type TResult = GQLQuery['testLambda'];

// eslint-disable-next-line @typescript-eslint/require-await
export const handler: AppSyncResolverHandler<unknown, TResult> = async (event, context) => {
    console.info('>>>>>EVENT', JSON.stringify(event, null, 2));
    console.info('>>>>>CONTEXT', JSON.stringify(context, null, 2));
    console.info('>>>>>ENV', JSON.stringify(process.env, null, 2));
    return 'Hello world';
};
