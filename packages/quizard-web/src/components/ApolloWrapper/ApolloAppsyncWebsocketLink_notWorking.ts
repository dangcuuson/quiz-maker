/* eslint-disable */

/**
 * Customised Apollo Websocket Link to work with AWS AppSync
 * based on the published websocket subscription workflow
 * https://docs.aws.amazon.com/appsync/latest/devguide/real-time-websocket-client.html
 * This custom wsLink focus on cognito userpool auth mode only
 * 
 * NOTE: even though the message and handshake are all correct, somehow the server doesn't return start_ack message
 */

import { createClient } from 'graphql-ws';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import _get from 'lodash/get';

const asBase64EncodedJson = (data: object): string => btoa(JSON.stringify(data));

const appendUrlWithHeaderAndPayload = (url: string, header: AuthHeader) => {
    return `${url}?header=${asBase64EncodedJson(header)}&payload=${asBase64EncodedJson({})}`;
};

type AuthHeader = {
    host: string;
    Authorization: string;
};

const createAppSyncWebSocketImpl = (authHeader: AuthHeader) => {
    return class AppSyncWebSocketImpl extends WebSocket {
        constructor(url: string) {
            // As stated in the doc: https://docs.aws.amazon.com/appsync/latest/devguide/real-time-websocket-client.html
            // The prorocol must be graphql-ws
            super(url, ['graphql-ws']);
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

export const createApolloAppSyncWebsocketLink = (options: { url: string; authToken: string }): GraphQLWsLink => {
    const APPSYNC_MAX_CONNECTION_TIMEOUT_MILLISECONDS = 5 * 60 * 1000;

    const host = new URL(options.url).host;
    const wsUrl = `wss://${host.replace('appsync-api', 'appsync-realtime-api')}/graphql`;
    const header: AuthHeader = {
        Authorization: options.authToken,
        host,
    };

    return new GraphQLWsLink(
        createClient({
            // As stated in the doc: https://docs.aws.amazon.com/appsync/latest/devguide/real-time-websocket-client.html
            // The query string must contain header and payload parameters:
            url: appendUrlWithHeaderAndPayload(wsUrl, header),
            webSocketImpl: createAppSyncWebSocketImpl(header),
            connectionAckWaitTimeout: APPSYNC_MAX_CONNECTION_TIMEOUT_MILLISECONDS,
        }),
    );
};
