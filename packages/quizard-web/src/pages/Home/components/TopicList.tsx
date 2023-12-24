import { Accordion, Autocomplete, Button, Card, Collection, Text } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import ApolloQueryWrapper from '@components/ApolloWrapper/ApolloQueryWrapper';
import { gql } from '@gql/gql';
import React from 'react';
import Fuse from 'fuse.js';

const client = generateClient();

const quizListItemFragment = gql(/* GraphQL */ `
    fragment QuizListItem on Quiz {
        quizId
        title
    }
`);

const quizListQuery = gql(/* GraphQL */ `
    query quizList($topic: String!) {
        quizList(topic: $topic) {
            ...QuizListItem
        }
    }
`);

interface Props {
    topicList: string[];
}
const TopicList: React.FC<Props> = ({ topicList }) => {
    const [searchKey, setSearchKey] = React.useState('');
    const [selectedTopic, setSelectedTopic] = React.useState('');
    const setSearchAndTopic = (v: string) => {
        setSearchKey(v);
        setSelectedTopic(v);
    };
    return (
        <React.Fragment>
            <Autocomplete
                label="Search topic or select one from below"
                labelHidden={true}
                size="large"
                options={topicList.map((topic) => ({ id: topic, label: topic }))}
                placeholder="Search topic or select one from below"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                onSelect={(v) => setSearchAndTopic(v.id)}
                onClear={() => setSearchAndTopic('')}
                variation="quiet"
            />
            {!selectedTopic && (
                <Collection type="list" items={topicList} direction="row" wrap="wrap" padding="small">
                    {(topic) => {
                        return (
                            <Card
                                key={topic}
                                borderRadius="medium"
                                variation="elevated"
                                backgroundColor="background.info"
                                grow="1"
                            >
                                <Text variation="primary">{topic}</Text>
                            </Card>
                        );
                    }}
                </Collection>
            )}
        </React.Fragment>
    );
};

interface ItemProps {
    topic: string;
}
const TopicListItem: React.FC<ItemProps> = ({ topic }) => {
    const [fetchItem, setFetchItem] = React.useState(false);
    return (
        <Accordion.Item value={topic}>
            <Accordion.Trigger onClick={() => setFetchItem(true)}>
                <Text variation="primary" isTruncated={true} fontSize="1.2em">
                    {topic}
                </Text>
                <Accordion.Icon />
            </Accordion.Trigger>
            <Accordion.Content>
                {!!fetchItem && (
                    <ApolloQueryWrapper
                        query={quizListQuery}
                        variables={{
                            topic,
                        }}
                    >
                        {({ data }) => {
                            return <div>{data.quizList.length}</div>;
                        }}
                    </ApolloQueryWrapper>
                )}
            </Accordion.Content>
        </Accordion.Item>
    );
    return (
        <Card padding="small" variation="elevated">
            <Text>{topic}</Text>
        </Card>
    );
};

export default TopicList;
