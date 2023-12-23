import React from 'react';
import { gql } from '../gql';
import ApolloQuerywrapper from '../components/ApolloWrapper/ApolloQueryWrapper';

const topicListQuery = gql(/* GraphQL */ `
    query topicList {
        topicList
        testLambda(value: "AAA")
    }
`);

interface Props {}
const GraphQLTest: React.FC<Props> = () => {
    return (
        <ApolloQuerywrapper query={topicListQuery}>
            {({ data }) => {
                return <div>{data.topicList.length}</div>;
            }}
        </ApolloQuerywrapper>
    );
};

export default GraphQLTest;
