import { Alert, Button, Loader, SelectField, View } from '@aws-amplify/ui-react';
import React from 'react';
import { useParams } from 'react-router';
import ApolloQueryWrapper from '@components/ApolloWrapper/ApolloQueryWrapper';
import { gql } from '@gql/gql';
import ScoresTable from './ScoresTable';
import { asType, isTuple } from '@utils/dataUtils';
import { ScoreAddedSubscription, ScoreAddedSubscriptionVariables } from '@gql/graphql';
import { Subscription } from '@apollo/client/react/components';

const scoreListQuery = gql(`
    query scoreList($pk: String!, $indexConfig: ScoreIndexConfig!, $sortCursor: String) {
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

const scoresAddedSubscription = gql(`
    subscription scoreAdded {
        scoreAdded {
            percentage
            nCorrect
            nQuestions
        }
    }
`);

const sortModes = ['Time', 'Score'] as const;
type SortMode = (typeof sortModes)[number];

interface Props {
    // quizCode: query scores of a quiz code
    // user: query scores from the logged in user
    filterMode: 'quizCode' | 'user';
}

const ScoresPage: React.FC<Props> = ({ filterMode }) => {
    const { quizCode } = useParams();
    const [sortMode, setSortMode] = React.useState<SortMode>('Time');

    if (!quizCode && filterMode === 'quizCode') {
        return <Alert variation="error" hasIcon={true} heading="Missing quiz code" />;
    }

    return (
        <React.Fragment>
            <Subscription<ScoreAddedSubscription, ScoreAddedSubscriptionVariables>
                subscription={scoresAddedSubscription}
                onData={(result) => {
                    console.log('>>scoreAdded', result.data);
                }}
            ></Subscription>
            <ApolloQueryWrapper
                fetchPolicy="network-only"
                notifyOnNetworkStatusChange={true}
                query={scoreListQuery}
                variables={{
                    pk: quizCode || '',
                    indexConfig: {
                        quizCode_createdAt: (filterMode === 'quizCode' && sortMode === 'Time') || undefined,
                        quizCode_percentage: (filterMode === 'quizCode' && sortMode === 'Score') || undefined,
                        user_createdAt: (filterMode === 'user' && sortMode === 'Time') || undefined,
                        user_percentage: (filterMode === 'user' && sortMode === 'Score') || undefined,
                    },
                }}
            >
                {({ data, fetchMore, loading }) => {
                    const hasMore = !!data.scoreList.lastEvaluatedKey;
                    return (
                        <View>
                            <SelectField
                                label="View"
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
                                <option value={asType<SortMode>('Time')}>Latest score</option>
                                <option value={asType<SortMode>('Score')}>Best score</option>
                            </SelectField>
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
        </React.Fragment>
    );
};

export default ScoresPage;
