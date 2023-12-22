import React from 'react';
import '@aws-amplify/ui-react/styles.css';
import { withAuthenticator, WithAuthenticatorProps } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';

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
  }
})

interface Props extends WithAuthenticatorProps { }
const App: React.FC<Props> = ({ user, signOut }) => {
  return (
    <>
      <h1>Hello {user?.username || 'Anonymous'}</h1>
      <button onClick={signOut}>Sign out</button>
    </>
  );
}

export default withAuthenticator(App);