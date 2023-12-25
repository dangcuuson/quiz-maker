import { Alert, Button, Loader, View } from '@aws-amplify/ui-react';
import React from 'react';
import { useParams } from 'react-router';
import ApolloQueryWrapper from '@components/ApolloWrapper/ApolloQueryWrapper';
import { gql } from '@gql/gql';
import ScoresTable from './ScoresTable';

const scoresOfQuizQuery = gql(`
    query scoresOfQuiz($quizCode: String!, $sortByTime: Boolean, $sortByPercentage: Boolean, $sortCursor: String) {
        scoreList(
            cond: { 
                pk: { string: $quizCode }
            }, 
            indexConfig: {
                quizCode_createdAt: $sortByTime,
                quizCode_percentage: $sortByPercentage
            } , 
            pagination: { 
                limit: 2, 
                exclusiveStartKey: $sortCursor 
            }
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

interface Props {}
const ScoresPage: React.FC<Props> = () => {
    const { quizCode } = useParams();
    if (!quizCode) {
        return <Alert variation="error" hasIcon={true} heading="Missing quiz code" />;
    }

    return (
        <ApolloQueryWrapper
            notifyOnNetworkStatusChange={true}
            query={scoresOfQuizQuery}
            variables={{
                quizCode: quizCode,
                sortByPercentage: true,
                sortByTime: undefined,
            }}
        >
            {({ data, fetchMore, loading }) => {
                const hasMore = !!data.scoreList.lastEvaluatedKey;
                return (
                    <View>
                        <ScoresTable items={data.scoreList.items} />
                        <Button
                            disabled={!hasMore}
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
                                                items: [...prev.scoreList.items, ...fetchMoreResult.scoreList.items],
                                                lastEvaluatedKey: fetchMoreResult.scoreList.lastEvaluatedKey,
                                            },
                                        };
                                    },
                                });
                            }}
                        >
                            {data.scoreList.items.length}
                        </Button>
                        {!!loading && <Loader variation="linear" />}
                    </View>
                );
            }}
        </ApolloQueryWrapper>
    );
};

export default ScoresPage;
