import { Alert, Button, Loader, SelectField, View, Text } from '@aws-amplify/ui-react';
import React from 'react';
import { useParams } from 'react-router';
import ApolloQueryWrapper from '@components/ApolloWrapper/ApolloQueryWrapper';
import { gql } from '@gql/gql';
import ScoresTable from './ScoresTable';
import { asType, isTuple } from '@utils/dataUtils';

const scoresOfQuizQuery = gql(`
    query scoresOfQuiz($pk: String!, $indexConfig: ScoreIndexConfig!, $sortCursor: String) {
        scoreList(
            cond: { 
                pk: { string: $pk }
            }, 
            indexConfig: $indexConfig , 
            pagination: { 
                limit: 10, 
                exclusiveStartKey: $sortCursor 
            },
            descSort: true
        ) {
            items {
                ...ScoreListItem
            }
            lastEvaluatedKey
        }
    }

    fragment ScoreListItem on Score {
        username
        userNickname
        createdAt
        quizCode
        percentage
        nQuestions
        nCorrect
    }
`);

const sortModes = ['Time', 'Score'] as const;
type SortMode = (typeof sortModes)[number];

interface Props {
    // quizCode: query scores of a quiz code
    // user: query scores from the logged in user
    // when filterMode = 'user', only sort by time by default
    filterMode: 'quizCode' | 'user';
}
const ScoresPage: React.FC<Props> = ({ filterMode }) => {
    const { quizCode } = useParams();
    const [sortMode, setSortMode] = React.useState<SortMode>('Time');
    if (!quizCode && filterMode === 'quizCode') {
        return <Alert variation="error" hasIcon={true} heading="Missing quiz code" />;
    }

    return (
        <ApolloQueryWrapper
            fetchPolicy='network-only'
            notifyOnNetworkStatusChange={true}
            query={scoresOfQuizQuery}
            variables={{
                pk: quizCode || '',
                indexConfig: {
                    quizCode_createdAt: (filterMode === 'quizCode' && sortMode === 'Time') || undefined,
                    quizCode_percentage: (filterMode === 'quizCode' && sortMode === 'Score') || undefined,
                    user_createdAt: filterMode === 'user' || undefined,
                },
            }}
        >
            {({ data, fetchMore, loading }) => {
                const hasMore = !!data.scoreList.lastEvaluatedKey;
                return (
                    <View>
                        {filterMode === 'quizCode' && (
                            <SelectField
                                label="Sort by"
                                size="small"
                                variation="quiet"
                                value={sortMode}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (isTuple(value, sortModes)) {
                                        setSortMode(value);
                                    }
                                }}
                            >
                                <option value={asType<SortMode>('Time')}>Time</option>
                                <option value={asType<SortMode>('Score')}>Score</option>
                            </SelectField>
                        )}
                        {filterMode === 'user' && <Text fontSize="1.25rem">My scores</Text>}

                        <ScoresTable
                            items={data.scoreList.items}
                            showQuizColumn={filterMode === 'user'}
                            showUserColumn={filterMode === 'quizCode'}
                        />
                        {!!hasMore && (
                            <Button
                                disabled={!hasMore}
                                size="small"
                                variation="link"
                                onClick={() => {
                                    void fetchMore({
                                        variables: {
                                            sortCursor: data.scoreList.lastEvaluatedKey,
                                        },
                                        updateQuery: (prev, { fetchMoreResult }) => {
                                            return {
                                                ...prev,
                                                scoreList: {
                                                    ...prev.scoreList,
                                                    items: [
                                                        ...prev.scoreList.items,
                                                        ...fetchMoreResult.scoreList.items,
                                                    ],
                                                    lastEvaluatedKey: fetchMoreResult.scoreList.lastEvaluatedKey,
                                                },
                                            };
                                        },
                                    });
                                }}
                            >
                                Load more items
                            </Button>
                        )}
                        {!!loading && <Loader variation="linear" />}
                    </View>
                );
            }}
        </ApolloQueryWrapper>
    );
};

export default ScoresPage;
