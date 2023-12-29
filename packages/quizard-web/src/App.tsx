import React from 'react';
import MainLayout from '@pages/MainLayout';
import ApolloCognitoProvider from './components/ApolloWrapper/ApolloCognitoProvider';
import ApolloMutationResultMessagePopup from './components/ApolloWrapper/ApolloMutationResultMessagePopup';
import { Amplify } from 'aws-amplify';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RouteItemConfig, routeConfigs } from '@config/routeConfigs';
import { withAuthenticator, WithAuthenticatorProps } from '@aws-amplify/ui-react';
import { LightDarkContextThemeProvider } from '@components/LightDarkMode/LightDarkContext';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: import.meta.env.VITE_userPoolId,
            userPoolClientId: import.meta.env.VITE_userPoolClientId,
            userAttributes: {
                email: { required: true },
                nickname: { required: true }
            },
            loginWith: {
                email: true,
            },
        },
    },
    API: {
        GraphQL: {
            defaultAuthMode: 'userPool',
            endpoint: import.meta.env.VITE_GraphQLAPIURL
        }
    }
});

const renderRoutes = (configMap: { [K: string]: RouteItemConfig }) => {
    return Object.values(configMap).map((config, index) => {
        return <Route key={index} {...config.props} />;
    });
};

interface Props extends WithAuthenticatorProps {}
const App: React.FC<Props> = () => {
    return (
        <LightDarkContextThemeProvider>
            <ApolloCognitoProvider>
                <ApolloMutationResultMessagePopup />
                <BrowserRouter basename={import.meta.env.BASE_URL}>
                    <MainLayout>
                        <Routes>{renderRoutes(routeConfigs)}</Routes>
                    </MainLayout>
                </BrowserRouter>
            </ApolloCognitoProvider>
        </LightDarkContextThemeProvider>
    );
};

export default withAuthenticator(App);
