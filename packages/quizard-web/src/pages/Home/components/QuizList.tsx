import React from 'react';
import { QuizListItemFragment } from '@gql/graphql';
import { Button, Card, Collection } from '@aws-amplify/ui-react';
import _ from 'lodash';

interface Props {
    items: QuizListItemFragment[];
}

const QuizList: React.FC<Props> = ({ items }) => {
    const sortedItems = React.useMemo(() => {
        return _.reverse(_.sortBy(items, (v) => v.title));
    }, [items]);
    return (
        <Collection type="list" items={sortedItems} gap="0">
            {(item) => {
                return (
                    <Card key={item.quizId} padding="small" variation="elevated">
                        <Button size="small">{item.title}</Button>
                    </Card>
                );
            }}
        </Collection>
    );
};

export default QuizList;
