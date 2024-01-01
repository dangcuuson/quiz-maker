import { createApolloAppSyncWebsocketLink_graphql_ws } from './ApolloAppsyncWebsocketLink_graphql-ws';
// import { createApolloAppSyncWebsocketLink_subscription_transport_ws } from './ApolloAppsyncWebsocketLink_subscription-transport-ws';

// replace these comments if we wish to switch implementation
export const createApolloAppSyncWebsocketLink = (options: { url: string; authToken: string }) => {
    // createApolloAppSyncWebsocketLink_subscription_transport_ws(options);
    return createApolloAppSyncWebsocketLink_graphql_ws(options);
};
