import { Alert, Button, Collection } from '@aws-amplify/ui-react';
import ApolloQueryWrapper from '@components/ApolloWrapper/ApolloQueryWrapper';
import { QuizCard, QuizCardContent, QuizCardText } from '@components/QuizCard/QuizCard';
import { gql } from '@gql/gql';
import { QuizListItemFragment } from '@gql/graphql';
import { routeConfigs } from '@config/routeConfigs';
import reverse from 'lodash/reverse';
import sortBy from 'lodash/sortBy';
import React from 'react';
import { useNavigate, useParams } from 'react-router';

const quizListQuery = gql(`
    query quizList($topic: String!) {
        quizList(cond: { pk: { string: $topic } }) {
            items {
                ...QuizListItem
            }
        }
    }

    fragment QuizListItem on Quiz {
        quizCode
        topic
        title
    }
`);

interface Props {}
const TopicItemPage: React.FC<Props> = () => {
    const { topic } = useParams();

    if (!topic) {
        return <Alert variation="error" hasIcon={true} heading="Missing topic" />;
    }
    return (
        <ApolloQueryWrapper query={quizListQuery} variables={{ topic }}>
            {({ data }) => {
                return <TopicItemPageInner quizList={data.quizList.items} />;
            }}
        </ApolloQueryWrapper>
    );
};

const TopicItemPageInner: React.FC<{ quizList: QuizListItemFragment[] }> = ({ quizList }) => {
    const sortedQuizList = React.useMemo(() => {
        return reverse(sortBy(quizList, (q) => q.title));
    }, [quizList]);
    const navigate = useNavigate();
    return (
        <React.Fragment>
            <Collection type="list" items={sortedQuizList} direction="column" padding="small">
                {(quizItem) => {
                    return (
                        <QuizCard
                            key={quizItem.quizCode}
                            onClick={() => {
                                navigate({ pathname: routeConfigs.quizItem.getPath(quizItem.topic, quizItem.title) });
                            }}
                        >
                            <QuizCardContent>
                                <QuizCardText>{quizItem.title}</QuizCardText>
                                <Button
                                    variation="link"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate({ pathname: routeConfigs.scores.getPath(quizItem.quizCode) });
                                    }}
                                >
                                    View scores
                                </Button>
                            </QuizCardContent>
                        </QuizCard>
                    );
                }}
            </Collection>
        </React.Fragment>
    );
};

export default TopicItemPage;
