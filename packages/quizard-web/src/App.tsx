import React from 'react';
import '@aws-amplify/ui-react/styles.css';
import { withAuthenticator, WithAuthenticatorProps } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import GraphQLTest from './pages/GraphQLTest';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_userPoolId,
      userPoolClientId: import.meta.env.VITE_userPoolClientId,
      userAttributes: {
        email: { required: true }
      },
      loginWith: {
        email: true
      }
    }
  },
  API: {
    GraphQL: {
      defaultAuthMode: 'userPool',
      endpoint: import.meta.env.VITE_GraphQLAPIURL,
      apiKey: import.meta.env.VITE_GraphQLAPIKey
    }
  }
})

interface Props extends WithAuthenticatorProps { }
const App: React.FC<Props> = (props) => {
  const { user, signOut } = props;
  return (
    <>
      <h1>Hello {user?.username || 'Anonymous'}</h1>
      <button onClick={signOut}>Sign out</button>
      <GraphQLTest />
    </>
  );
}

export default withAuthenticator(App);