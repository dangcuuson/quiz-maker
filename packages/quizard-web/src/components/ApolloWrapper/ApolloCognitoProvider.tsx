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
import { fetchAuthSession } from 'aws-amplify/auth';
import React from 'react';

const useCognitoAuthToken = (): { token: string; ready: boolean } => {
    const [authToken, setAuthToken] = React.useState<string>('');
    const [ready, setReady] = React.useState(false);
    React.useEffect(() => {
        fetchAuthSession()
            .then((data) => {
                if (data.tokens) {
                    setAuthToken(`Bearer ${data.tokens.accessToken.toString()}`);
                } else {
                    console.warn('Access token not found');
                    setAuthToken('');
                }
            })
            .catch((err) => {
                console.error(`Unable to fetch auth session`, err);
                setAuthToken('');
            })
            .finally(() => {
                setReady(true);
            });
    }, []);
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
