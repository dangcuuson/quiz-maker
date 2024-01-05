import React from 'react';
import { gql } from '@gql/index';
import ApolloQuerywrapper from '@components/ApolloWrapper/ApolloQueryWrapper';
import { View, Text, Autocomplete, Flex } from '@aws-amplify/ui-react';
import TopicItemCard from './components/TopicItemCard';
import PopulateDataBtn from './components/PopulateDataBtn';
import { useNavigate } from 'react-router-dom';
import { routeConfigs } from '@config/routeConfigs';

const topicListQuery = gql(`
    query topicList {
        topicList
    }
`);

interface Props {}
const HomePage: React.FC<Props> = () => {
    const navigate = useNavigate();
    const selectTopic = (topic: string) => {
        navigate({
            pathname: routeConfigs.quizList.getPath(topic),
        });
    };
    const [topicList, setTopicList] = React.useState<null | string[]>(null);

    const topicCardPlaceHolder = <TopicItemCard topic={'\u00a0'} onClick={() => null} />;
    const loadingEl = (
        <Flex direction="row" wrap="wrap" padding="small">
            {topicCardPlaceHolder}
            {topicCardPlaceHolder}
            {topicCardPlaceHolder}
            {topicCardPlaceHolder}
        </Flex>
    );
    return (
        <React.Fragment>
            <Autocomplete
                isLoading={!topicList}
                label="Search topic"
                labelHidden={true}
                size="large"
                options={(topicList || []).map((topic) => ({ id: topic, label: topic }))}
                placeholder="Search topic"
                onSelect={(v) => selectTopic(v.id)}
                variation="quiet"
            />
            <ApolloQuerywrapper
                query={topicListQuery}
                loadingEl={loadingEl}
                // this flag is needed if we want onCompleted to be triggered on refetch
                notifyOnNetworkStatusChange={true}
                onCompleted={(data) => setTopicList(data.topicList)}
            >
                {({ data, refetch }) => {
                    if (data.topicList.length === 0) {
                        return (
                            <View>
                                <Text>There's no quiz data</Text>
                                <PopulateDataBtn onCompleted={() => void refetch()} />
                            </View>
                        );
                    }
                    return (
                        <Flex direction="row" wrap="wrap" padding="small" testId="topic-list-container">
                            {data.topicList.map((topic) => (
                                <TopicItemCard key={topic} topic={topic} onClick={() => selectTopic(topic)} />
                            ))}
                        </Flex>
                    );
                }}
            </ApolloQuerywrapper>
        </React.Fragment>
    );
};

export default HomePage;
