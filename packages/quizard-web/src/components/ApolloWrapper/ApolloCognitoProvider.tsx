// this import needs to be above '@apollo/client' because
// it uses 'subscriptions-transport-ws'
// // https://stackoverflow.com/questions/77245506/cannot-read-properties-of-undefined-reading-field-when-bumping-apollo-clien
import { createApolloAppSyncWebsocketLink } from './ApolloAppsyncWebsocketLink';
import {
    ApolloClient,
    ApolloLink,
    ApolloProvider,
    HttpLink,
    InMemoryCache,
    NormalizedCacheObject,
    split,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { useEffectOnce } from '@hooks/hooks';
import { persistCache } from 'apollo3-cache-persist';
import * as Auth from 'aws-amplify/auth';
import React from 'react';
import { getMainDefinition } from '@apollo/client/utilities';
import { Kind, OperationTypeNode } from 'graphql';

const useCognitoAuthToken = (): { token: string; ready: boolean } => {
    const [authToken, setAuthToken] = React.useState<string>('');
    const [tokenExpiry, setTokenExpiry] = React.useState(0);
    const [ready, setReady] = React.useState(false);

    // fetch auth token on mount
    const fetchAuthToken = async (forceRefresh: boolean) => {
        try {
            await Auth.getCurrentUser();
            const session = await Auth.fetchAuthSession({ forceRefresh });
            if (session.tokens) {
                setTokenExpiry(session.tokens.accessToken.payload.exp || 0);
                setAuthToken(session.tokens.accessToken.toString());
            } else {
                console.warn('Access token not found');
                setAuthToken('');
            }
        } catch (err) {
            console.error(`Unable to fetch auth session`, err);
            setAuthToken('');
        } finally {
            setReady(true);
        }
    };
    useEffectOnce(() => {
        void fetchAuthToken(false);
    });

    // when token is about to expire, fetch auth token again to keep user connected
    React.useEffect(() => {
        if (!tokenExpiry) {
            return;
        }
        const timeToTimeout = tokenExpiry * 1000 - +Date.now();
        const timeout = setTimeout(() => {
            void fetchAuthToken(true);
        }, timeToTimeout - 10000);
        return () => {
            clearTimeout(timeout);
        };
    }, [tokenExpiry]);

    return { token: authToken, ready };
};

const makeApolloClient = async (authToken: string): Promise<ApolloClient<NormalizedCacheObject>> => {
    // just log error to console for now
    // In future we can modify this to e.g display an error dialog
    const errorLink = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
            console.warn('>>>> GraphQL ERROR: ', graphQLErrors);
        }

        if (networkError) {
            console.warn('>>>> NETWORK ERROR: ', networkError);
        }
    });

    const authLink = setContext((_, { headers }) => {
        return {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            headers: {
                ...headers,
                authorization: authToken,
            },
        };
    });

    const httpLink = new HttpLink({
        uri: import.meta.env.VITE_GraphQLAPIURL,
    });

    const wsLink = createApolloAppSyncWebsocketLink({
        url: import.meta.env.VITE_GraphQLAPIURL,
        authToken,
    });

    const splitHTTPAndWSLink = split(
        ({ query }) => {
            const definition = getMainDefinition(query);
            return (
                definition.kind === Kind.OPERATION_DEFINITION && definition.operation === OperationTypeNode.SUBSCRIPTION
            );
        },
        wsLink,
        httpLink,
    );

    const link = ApolloLink.from([errorLink, authLink, splitHTTPAndWSLink]);

    const cache = new InMemoryCache();
    await persistCache({
        cache,
        storage: localStorage,
    });
    const client = new ApolloClient({ cache, link });
    return client;
};

interface Props {
    children: React.ReactNode;
}
const ApolloCognitoProvider: React.FC<Props> = ({ children }) => {
    const { token, ready } = useCognitoAuthToken();
    const [client, setClient] = React.useState<null | ApolloClient<NormalizedCacheObject>>(null);
    React.useEffect(() => {
        if (!ready) {
            return;
        }
        void makeApolloClient(token).then(setClient);
    }, [token, ready]);

    if (!client) {
        return <div>Loading...</div>;
    }
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloCognitoProvider;
