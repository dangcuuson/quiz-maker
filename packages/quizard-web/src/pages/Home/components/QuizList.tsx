import React from 'react';
import { QuizListItemFragment } from '@gql/graphql';
import { Button, Card } from '@aws-amplify/ui-react';
import _ from 'lodash';

interface Props {
    items: QuizListItemFragment[];
}

const QuizList: React.FC<Props> = ({ items }) => {
    const sortedItems = React.useMemo(
        () => {
            return _.reverse(_.sortBy(items, v => v.title));
        },
        [items]
    );
    return (
        <React.Fragment>
            {sortedItems.map((item) => {
                return (
                    <Card key={item.quizId}>
                        <Button>{item.title}</Button>
                    </Card>
                );
            })}
        </React.Fragment>
    );
};

export default QuizList;
