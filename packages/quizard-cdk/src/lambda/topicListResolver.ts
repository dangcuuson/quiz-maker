import { AppSyncResolverHandler } from 'aws-lambda';
import { GQLQuery } from '../shared/gqlTypes';

type TResult = GQLQuery['topicList'];

// eslint-disable-next-line @typescript-eslint/require-await
export const handler: AppSyncResolverHandler<unknown, TResult> = async (event, context) => {
  // Print Event
  console.info('>>>>>EVENT', JSON.stringify(event, null, 2));
  console.info('>>>>>CONTEXT', JSON.stringify(context, null, 2));
  console.info('>>>>>ENV', JSON.stringify(process.env, null, 2));

  return ['Maths', 'English', 'History', 'Geography', 'Javascript', 'React'];
};
