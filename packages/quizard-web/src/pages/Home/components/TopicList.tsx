import { Autocomplete, Collection } from '@aws-amplify/ui-react';
import { QuizCard, QuizCardContent, QuizCardText } from '@components/QuizCard/QuizCard';
import { routeConfigs } from '@pages/routeConfig';
import React from 'react';
import { useNavigate } from 'react-router';

interface Props {
    topicList: string[];
}
const TopicList: React.FC<Props> = ({ topicList }) => {
    const navigate = useNavigate();
    const selectTopic = (topic: string) => {
        navigate({
            pathname: routeConfigs.quizList.getPath(topic),
        });
    };
    return (
        <React.Fragment>
            <Autocomplete
                label="Search topic"
                labelHidden={true}
                size="large"
                options={topicList.map((topic) => ({ id: topic, label: topic }))}
                placeholder="Search topic"
                onSelect={(v) => selectTopic(v.id)}
                variation="quiet"
            />
            <Collection type="list" items={topicList} direction="row" wrap="wrap" padding="small">
                {(topic) => <TopicItem key={topic} topic={topic} onClick={() => selectTopic(topic)} />}
            </Collection>
        </React.Fragment>
    );
};

interface ItemProps {
    topic: string;
    onClick: () => void;
}
const TopicItem: React.FC<ItemProps> = ({ topic, onClick }) => {
    return (
        <QuizCard variation="elevated" onClick={onClick}>
            <QuizCardContent>
                <QuizCardText variation="primary">
                    {topic}
                </QuizCardText>
            </QuizCardContent>
        </QuizCard>
    );
};

export default TopicList;
