import { Autocomplete, Collection } from '@aws-amplify/ui-react';
import ApolloQueryWrapper from '@components/ApolloWrapper/ApolloQueryWrapper';
import { gql } from '@gql/gql';
import React from 'react';
import TopicItem from './TopicItem';

const quizListQuery = gql(/* GraphQL */ `
    query quizList($topic: String!) {
        quizList(topic: $topic) {
            ...QuizListItem
        }
    }

    fragment QuizListItem on Quiz {
        quizId
        title
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
                    {(topic) => <TopicItem key={topic} topic={topic} onClick={() => setSearchAndTopic(topic)} />}
                </Collection>
            )}
            {!!selectedTopic && (
                <ApolloQueryWrapper
                    query={quizListQuery}
                    variables={{
                        topic: selectedTopic,
                    }}
                >
                    {({ data }) => {
                        return <div>{data.quizList.length}</div>;
                    }}
                </ApolloQueryWrapper>
            )}
        </React.Fragment>
    );
};
export default TopicList;
