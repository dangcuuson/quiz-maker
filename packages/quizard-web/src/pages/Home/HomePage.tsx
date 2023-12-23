import React from 'react';
import { gql } from '@gql/index';
import ApolloQuerywrapper from '@components/ApolloWrapper/ApolloQueryWrapper';
import PopulateDataBtn from '@components/PopulateDataBtn/PopulateDataBtn';
import { View, Text } from '@aws-amplify/ui-react';

const topicListQuery = gql(/* GraphQL */ `
    query topicList {
        topicList
    }
`);

interface Props {}
const GraphQLTest: React.FC<Props> = () => {
    return (
        <ApolloQuerywrapper query={topicListQuery}>
            {({ data, refetch }) => {
                if (data.topicList.length === 0) {
                    return (
                        <View>
                            <Text>There's no quiz data</Text>
                            <PopulateDataBtn onCompleted={refetch} />
                        </View>
                    )
                }
                return <div>{data.topicList.length}</div>;
            }}
        </ApolloQuerywrapper>
    );
};

export default GraphQLTest;
