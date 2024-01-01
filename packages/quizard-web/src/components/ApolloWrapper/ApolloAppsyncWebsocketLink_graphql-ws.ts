/* eslint-disable */

/**
 * Customised Apollo Websocket Link to work with AWS AppSync
 * based on the published websocket subscription workflow
 * https://docs.aws.amazon.com/appsync/latest/devguide/real-time-websocket-client.html
 * This custom wsLink focus on cognito userpool auth mode only
 *
 * The graphql-ws uses a different protocol than AppSync:
 * https://github.com/enisdenjo/graphql-ws/blob/HEAD/PROTOCOL.md
 * So we write a custom WebsocketImpl to handle the differences
 */

// 'graphql-ws' needs to be imported before @apollo/client/*
import { createClient, MessageType } from 'graphql-ws';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import _get from 'lodash/get';

const asBase64EncodedJson = (data: object): string => btoa(JSON.stringify(data));

const appendUrlWithHeaderAndPayload = (url: string, header: AuthHeader) => {
    return `${url}?header=${asBase64EncodedJson(header)}&payload=${asBase64EncodedJson({})}`;
};

const tryParseJsonString = (jsonString: string) => {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return undefined;
    }
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

        set onmessage(handler: any) {
            // need some interceptions to bridge the difference between the 2 protocols
            // protocols used by graphql-ws: https://github.com/enisdenjo/graphql-ws/blob/HEAD/PROTOCOL.md
            super.onmessage = (event) => {
                if (event.data) {
                    const data = tryParseJsonString(event.data);

                    // ignore start_ack and ka
                    if (data && data.type === 'start_ack') {
                        return;
                    }
                    if (data && data.type === 'ka') {
                        return;
                    }

                    // type: "data" => type: "next"
                    if (data && data.type === 'data') {
                        if (data.payload.errors) {
                            // could inject an onError callback here to display on UI instead of console.error
                            console.error('Subscription error', data.payload.errors);
                            return;
                        }
                        handler({
                            ...event,
                            data: JSON.stringify({
                                ...data,
                                type: MessageType.Next,
                            }),
                        });
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
                // intercept subscribe message and override it to match with
                // expected payload from AWS AppSync
                const dataJson = JSON.parse(data);
                if (dataJson.type === 'subscribe') {
                    const newData = {
                        id: dataJson.id,
                        payload: {
                            data: JSON.stringify({
                                query: dataJson.payload.query,
                            }),
                            extensions: {
                                authorization: authHeader,
                            },
                        },
                        type: 'start',
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

export const createApolloAppSyncWebsocketLink_graphql_ws = (options: {
    url: string;
    authToken: string;
}): GraphQLWsLink => {
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
            lazy: true
        }),
    );
};
