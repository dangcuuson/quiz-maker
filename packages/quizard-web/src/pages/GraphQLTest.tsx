import React from 'react';
import { gql } from '../gql';
import { createApolloQuery } from '../components/ApolloQuery/ApolloQuery';

const topicListQuery = gql(/* GraphQL */ `
    query topicList {
        topicList
        testLambda(value: "AAA")
    }
`);
const TopicListQuery = createApolloQuery(topicListQuery);

interface Props {}
const GraphQLTest: React.FC<Props> = () => {
    return (
        <TopicListQuery>
            {({ data }) => {
                return <div>{data.topicList.length}</div>
            }}
        </TopicListQuery>
    )
};

export default GraphQLTest;
