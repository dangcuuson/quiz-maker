import { ApolloQueryResult, DocumentNode, OperationVariables, QueryResult, TypedDocumentNode } from '@apollo/client';
import { Query, QueryComponentOptions } from '@apollo/client/react/components';
import { Alert, Placeholder } from '@aws-amplify/ui-react';
import _ from 'lodash';
import React from 'react';

type RefetchFunc<TData, TVariables> = (variables?: Partial<TVariables>) => Promise<ApolloQueryResult<TData>>;

// normal Query will have data as TData | undefined
// it is undefined if Query is loading, or has error
// This create a pattern in using Query:
// 1. if loading, render loading element
// 2. if error, render error element
// 3. otherwise, render data
// This component will make step 1 and 2 generic, and user only need to focus on step 3
// This way, we also force data to be TData, instead of undefined/empty, which makes it
// easier for developer

type RenderProps<TData, TVariables extends OperationVariables> = (
    result: QueryResult<TData, TVariables> & { data: TData },
) => React.ReactNode;

export type QueryProps<TData, TVariables extends OperationVariables> = Omit<
    QueryComponentOptions<TData, TVariables>,
    'query' | 'children' | 'onCompleted'
> & {
    onCompleted?: (data: TData) => void;
    loadingEl?: JSX.Element;
    errorEl?: (errorMessage: string, refetch: RefetchFunc<TData, TVariables>) => JSX.Element;
    children?: RenderProps<TData, TVariables>;
};

export function createApolloQuery<TData, TVariables extends OperationVariables = Record<string, string>>(
    documentNode: DocumentNode | TypedDocumentNode<TData, TVariables>,
): React.ComponentType<QueryProps<TData, TVariables>> {
    type Props = QueryProps<TData, TVariables>;

    const Querier: React.FC<Props> = (props) => {
        const [, setState] = React.useState('');
        return (
            <Query
                fetchPolicy={props.fetchPolicy}
                query={documentNode}
                variables={props.variables}
                onCompleted={(data: TData) => {
                    if (!data || _.isEmpty(data) || !props.onCompleted) {
                        return;
                    }
                    try {
                        props.onCompleted(data);
                    } catch (err) {
                        // https://github.com/facebook/react/issues/11334#issuecomment-423718317
                        setState(() => {
                            throw err;
                        });
                    }
                }}
                onError={props.onError}
                errorPolicy={props.errorPolicy}
                pollInterval={props.pollInterval}
            >
                {(_result: QueryResult) => {
                    const typedResult = _result as QueryResult<TData, TVariables>;
                    const { data, loading, error, refetch } = typedResult;

                    const getErrorEl = () => {
                        if (!error) {
                            return null;
                        }
                        const getErrorMessage = () => {
                            if (import.meta.env.PROD) {
                                console.error(error);
                                return 'Unable to fetch data';
                            }
                            return error.message;
                        };
                        const errorMessage = getErrorMessage();
                        return props.errorEl ? (
                            props.errorEl(errorMessage, refetch)
                        ) : (
                            <Alert variation="error" hasIcon={true} heading={errorMessage} />
                        );
                    };

                    const getLoadingEl = () => props.loadingEl || <Placeholder />;

                    // if error policy is 'all', ignore data if there's error
                    if (props.errorPolicy === 'all' && !!error) {
                        return getErrorEl();
                    }

                    // no data => it could be loading or error
                    if (!data || _.isEmpty(data)) {
                        // if error
                        if (error) {
                            // since there's no data, we just returns the error
                            return getErrorEl();
                        }

                        // if loading
                        if (loading) {
                            // since there's no data, we just returns the loading indicator
                            return getLoadingEl();
                        }

                        // no error, no loading, no data
                        // shouldn't reach here but we display this just in case
                        return <Alert variation="error" heading={'Error when trying to fetch data'} />;
                    }

                    const children = _.isFunction(props.children)
                        ? props.children({ ...typedResult, data })
                        : props.children || null;
                    return <React.Fragment>{children}</React.Fragment>;
                }}
            </Query>
        );
    };
    return Querier;
}
