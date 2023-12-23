import { AppSyncResolverHandler } from 'aws-lambda';
import { GQLQuery } from '../shared/gqlTypes';
import { helloWord } from '/opt/utils';

type TResult = GQLQuery['testLambda'];

// eslint-disable-next-line @typescript-eslint/require-await
export const handler: AppSyncResolverHandler<unknown, TResult> = async (event, context) => {
  // Print Event
  console.info('>>>>>EVENT', JSON.stringify(event, null, 2));
  console.info('>>>>>EVENT', JSON.stringify(context, null, 2));


  return helloWord();
};
