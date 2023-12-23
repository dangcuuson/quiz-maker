import React from 'react';
import { gql } from '@gql/index';
import ApolloQuerywrapper from '@components/ApolloWrapper/ApolloQueryWrapper';
import PopulateDataBtn from '@components/PopulateDataBtn/PopulateDataBtn';
import { View, Text, SelectField } from '@aws-amplify/ui-react';
import QuizList from './components/QuizList';

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
                return <HomePageInner topicList={data.topicList} />;
            }}
        </ApolloQuerywrapper>
    );
};

export const quizListItemFragment = gql(/* GraphQL */ `
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
interface InnerProps {
    topicList: string[];
}
const HomePageInner: React.FC<InnerProps> = ({ topicList }) => {
    const [selectedTopic, setSelectedTopic] = React.useState('');
    return (
        <React.Fragment>
            <SelectField
                label="Topic"
                labelHidden={true}
                value={selectedTopic}
                placeholder="Select topic"
                onChange={(e) => setSelectedTopic(e.target.value)}
            >
                {topicList.map((topic) => (
                    <option key={topic} value={topic} children={topic} />
                ))}
            </SelectField>
            {!!selectedTopic && (
                <View padding="small">
                    <ApolloQuerywrapper
                        query={quizListQuery}
                        variables={{
                            topic: selectedTopic,
                        }}
                    >
                        {({ data }) => {
                            return <QuizList items={data.quizList} />;
                        }}
                    </ApolloQuerywrapper>
                </View>
            )}
        </React.Fragment>
    );
};

export default HomePage;
