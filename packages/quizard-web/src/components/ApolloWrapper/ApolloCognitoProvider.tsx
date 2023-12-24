import {
    ApolloClient,
    ApolloLink,
    ApolloProvider,
    HttpLink,
    InMemoryCache,
    NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import * as Auth from 'aws-amplify/auth';
import React from 'react';

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
                console.log('>>Found tokens');
                console.log(session.tokens.accessToken.payload.exp);
                setTokenExpiry(session.tokens.accessToken.payload.exp || 0);
                setAuthToken(`Bearer ${session.tokens.accessToken.toString()}`);
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
    React.useEffect(() => {
        fetchAuthToken(false);
    }, []);

    // when token is about to expire, fetch auth token again to keep user connected
    React.useEffect(() => {
        if (!tokenExpiry) {
            return;
        }
        const timeToTimeout = tokenExpiry * 1000 - +Date.now();
        console.log('>>timeToTimeout', timeToTimeout);
        const timeout = setTimeout(() => {
            fetchAuthToken(true);
        }, timeToTimeout - 10000);
        return () => {
            clearTimeout(timeout);
        };
    }, [tokenExpiry]);

    return { token: authToken, ready };
};

const makeApolloClient = (authToken: string): ApolloClient<NormalizedCacheObject> => {
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

    const link = ApolloLink.from([errorLink, authLink, httpLink]);

    const cache = new InMemoryCache();
    const client = new ApolloClient({ cache, link });
    return client;
};

interface Props {
    children: React.ReactNode;
}
const ApolloCognitoProvider: React.FC<Props> = ({ children }) => {
    const { token, ready } = useCognitoAuthToken();
    const client = React.useMemo(() => {
        if (!ready) {
            return null;
        }
        return makeApolloClient(token);
    }, [token, ready]);

    if (!client) {
        return <div>Loading...</div>;
    }
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloCognitoProvider;
