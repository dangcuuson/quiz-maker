import React from 'react';
import { gql } from '@gql/index';
import ApolloQuerywrapper from '@components/ApolloWrapper/ApolloQueryWrapper';
import PopulateDataBtn from '@components/PopulateDataBtn/PopulateDataBtn';
import { View, Text } from '@aws-amplify/ui-react';
import TopicList from './components/TopicList';

const topicListQuery = gql(/* GraphQL */ `
    query topicList {
        topicList
    }
`);

interface Props {}
const HomePage: React.FC<Props> = () => {
    return (
        <ApolloQuerywrapper query={topicListQuery}>
            {({ data, refetch }) => {
                if (data.topicList.length === 0) {
                    return (
                        <View>
                            <Text>There's no quiz data</Text>
                            <PopulateDataBtn onCompleted={refetch} />
                        </View>
                    );
                }
                return <TopicList topicList={data.topicList} />;
            }}
        </ApolloQuerywrapper>
    );
};

export default HomePage;
