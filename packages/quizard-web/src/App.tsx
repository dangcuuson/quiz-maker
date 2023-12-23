import React from 'react';
import { withAuthenticator, WithAuthenticatorProps, ThemeProvider } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import GraphQLTest from './pages/GraphQLTest';
import ApolloCognitoProvider from './components/ApolloWrapper/ApolloCognitoProvider';
import ApolloMutationResultMessagePopup from './components/ApolloWrapper/ApolloMutationResultMessagePopup';

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: import.meta.env.VITE_userPoolId,
            userPoolClientId: import.meta.env.VITE_userPoolClientId,
            userAttributes: {
                email: { required: true },
            },
            loginWith: {
                email: true,
            },
        },
    },
});

interface Props extends WithAuthenticatorProps {}
const App: React.FC<Props> = (props) => {
    const { user, signOut } = props;
    return (
        <ThemeProvider>
            <ApolloMutationResultMessagePopup />
            <ApolloCognitoProvider>
                <h1>Hello {user?.username || 'Anonymous'}</h1>
                <button onClick={signOut}>Sign out</button>
                <GraphQLTest />
            </ApolloCognitoProvider>
        </ThemeProvider>
    );
};

export default withAuthenticator(App);
