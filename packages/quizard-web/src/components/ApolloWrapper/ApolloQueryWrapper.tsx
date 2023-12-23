import { ApolloQueryResult, OperationVariables, QueryResult } from '@apollo/client';
import { Query, QueryComponentOptions } from '@apollo/client/react/components';
import { Alert, Placeholder } from '@aws-amplify/ui-react';
import _ from 'lodash';
import React from 'react';

// normal ApolloQuery will have data as TData | undefined
// it is undefined if Query is loading, or has error
// This create a pattern in using Query:
// 1. if loading, render loading element
// 2. if error, render error element
// 3. otherwise, render data
// This component will handle step 1 and 2, and user only need to focus on step 3
// This way, we also force data to be TData, instead of undefined/empty, which makes it
// easier for typing
// Note that normal ApolloQuery also allow both data & error to be defined if errorPolicy='all'
// https://www.apollographql.com/docs/react/data/error-handling/#partial-data-with-resolver-errors

type RefetchFunc<TData, TVariables> = (variables?: Partial<TVariables>) => Promise<ApolloQueryResult<TData>>;
type RenderProps<TData, TVariables extends OperationVariables> = (
    result: QueryResult<TData, TVariables> & { data: TData },
) => React.ReactNode;

type QueryWrapperProps<TData, TVariables extends OperationVariables> = Omit<
    QueryComponentOptions<TData, TVariables>,
    'children'
> & {
    loadingEl?: JSX.Element;
    errorEl?: (errorMessage: string, refetch: RefetchFunc<TData, TVariables>) => JSX.Element;
    children?: RenderProps<TData, TVariables>;
};

function ApolloQueryWrapper<TData, TVariables extends OperationVariables>(
    props: QueryWrapperProps<TData, TVariables>,
): React.ReactNode {
    const { children, loadingEl, errorEl, ...queryProps } = props;
    return (
        // any should be TVariables but it gives type error
        <Query<TData, any> {...queryProps}>
            {(_result: QueryResult) => {
                const typedResult = _result as QueryResult<TData, TVariables>;
                const { data, loading, error, refetch } = typedResult;

                if (loading) {
                    // PlaceHolder is default loadingEl
                    return props.loadingEl || <Placeholder />;
                }

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

                // when errorPolicy = 'all' we allow partial data render along with error
                // to make it consistent with normal ApolloQuery behaviour
                if (!!error && props.errorPolicy !== 'all') {
                    return getErrorEl();
                }

                // no data can happen when errorPolicy = 'ignore'
                if (!data || _.isEmpty(data)) {
                    return getErrorEl();
                }

                const children = _.isFunction(props.children)
                    ? props.children({ ...typedResult, data })
                    : props.children || null;
                return <React.Fragment>{children}</React.Fragment>;
            }}
        </Query>
    );
}

export default ApolloQueryWrapper;