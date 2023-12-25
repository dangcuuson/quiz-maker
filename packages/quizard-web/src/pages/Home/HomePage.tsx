import React from 'react';
import { gql } from '@gql/index';
import ApolloQuerywrapper from '@components/ApolloWrapper/ApolloQueryWrapper';
import { View, Text } from '@aws-amplify/ui-react';
import TopicList from './components/TopicList';
import PopulateDataBtn from './components/PopulateDataBtn';

const topicListQuery = gql(`
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
                            <PopulateDataBtn onCompleted={() =>void refetch()} />
                        </View>
                    );
                }
                return <TopicList topicList={data.topicList} />;
            }}
        </ApolloQuerywrapper>
    );
};

export default HomePage;
