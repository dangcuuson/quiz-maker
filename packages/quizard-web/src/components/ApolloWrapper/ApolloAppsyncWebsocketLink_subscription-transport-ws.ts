/* eslint-disable */

/**
 * Customised Apollo Websocket Link to work with AWS AppSync
 * based on the published websocket subscription workflow
 * https://docs.aws.amazon.com/appsync/latest/devguide/real-time-websocket-client.html
 * This custom wsLink focus on cognito userpool auth mode only
 * Some idea is from: https://github.com/apollographql/apollo-feature-requests/issues/224
 */

// 'subscriptions-transport-ws' needs to be import before @apollo/client/*
import { Middleware, SubscriptionClient } from 'subscriptions-transport-ws';
import { WebSocketLink } from '@apollo/client/link/ws';
import * as graphqlPrinter from "graphql/language/printer";

const asBase64EncodedJson = (data: object): string => btoa(JSON.stringify(data));

const appendUrlWithHeaderAndPayload = (url: string, header: AuthHeader) => {
    return `${url}?header=${asBase64EncodedJson(header)}&payload=${asBase64EncodedJson({})}`;
};

function tryParseJsonString(jsonString: string) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return undefined;
    }
}

const createAppSyncWebSocketImpl = (authHeader: AuthHeader) => {
    return class AppSyncWebSocketImpl extends WebSocket {
        constructor(url: string) {
            // As stated in the doc: https://docs.aws.amazon.com/appsync/latest/devguide/real-time-websocket-client.html
            // The prorocol must be graphql-ws
            super(url, ['graphql-ws']);
        }

        set onmessage(handler: any) {
            super.onmessage = event => {
                if (event.data) {
                    const data = tryParseJsonString(event.data);

                    if (data && data.type === 'start_ack') {
                        return;
                    }
                }

                return handler(event);
            };
        }

        send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
            if (typeof data !== 'string') {
                super.send(data);
                return;
            }

            try {
                // intercept normal subscribe and customise it to match with
                // expected payload from AWS AppSync
                const dataJson = JSON.parse(data);
                if (dataJson.type === 'subscribe') {
                    const newData = {
                        id: dataJson.id,
                        type: 'start',
                        payload: {
                            data: JSON.stringify({
                                query: dataJson.payload.query
                            }),
                            extensions: {
                                authorization: authHeader,
                            },
                        },
                    };
                    super.send(JSON.stringify(newData));
                } else {
                    super.send(data);
                }
            } catch {
                super.send(data);
            }
        }
    };
};

type AuthHeader = {
    host: string;
    Authorization: string;
};

export const createApolloAppSyncWebsocketLink_subscription_transport_ws = (options: { url: string; authToken: string }) => {
    const APPSYNC_MAX_CONNECTION_TIMEOUT_MILLISECONDS = 5 * 60 * 1000;

    const host = new URL(options.url).host;
    const wsUrl = `wss://${host.replace('appsync-api', 'appsync-realtime-api')}/graphql`;
    const header: AuthHeader = {
        Authorization: options.authToken,
        host,
    };

    const createAppSyncGraphQLOperationAdapter = (): Middleware => ({
        applyMiddleware: async (options, next) => {
            // AppSync expects GraphQL operation to be defined as a JSON-encoded object in a "data" property
            options.data = JSON.stringify({
                type: 'start',
                query: !options.query ? '' : typeof options.query === 'string' ? options.query : graphqlPrinter.print(options.query),
                variables: options.variables
            });
    
            // AppSync only permits authorized operations
            options.extensions = {
                authorization: header
            }
    
            // AppSync does not care about these properties
            delete options.operationName;
            delete options.variables;
            // Not deleting "query" property as SubscriptionClient validation requires it
    
            next();
        }
    })

    return new WebSocketLink(
        new SubscriptionClient(appendUrlWithHeaderAndPayload(wsUrl, header), {
            timeout: APPSYNC_MAX_CONNECTION_TIMEOUT_MILLISECONDS,
            lazy: true,
        }, createAppSyncWebSocketImpl(header)).use([
            createAppSyncGraphQLOperationAdapter()
        ]),
    );
};