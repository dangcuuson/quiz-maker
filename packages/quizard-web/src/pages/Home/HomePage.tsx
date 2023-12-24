import React from 'react';
import { gql } from '@gql/index';
import ApolloQuerywrapper from '@components/ApolloWrapper/ApolloQueryWrapper';
import { View, Text } from '@aws-amplify/ui-react';
import TopicList from './components/TopicList';
import PopulateDataBtn from './components/PopulateDataBtn';
import { useSetBreadcrumbsOnMount } from '@components/QuizBreadcrumbs/QuizBreadcrumbs';

const topicListQuery = gql(/* GraphQL */ `
    query topicList {
        topicList
    }
`);

interface Props {}
const HomePage: React.FC<Props> = () => {
    useSetBreadcrumbsOnMount({ type: 'home' });
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
