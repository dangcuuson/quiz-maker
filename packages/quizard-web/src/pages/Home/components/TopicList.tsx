import { Autocomplete, Card, Collection, View, Text } from '@aws-amplify/ui-react';
import { routeConfigs } from '@pages/routeConfig';
import React from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

interface Props {
    topicList: string[];
}
const TopicList: React.FC<Props> = ({ topicList }) => {
    const navigate = useNavigate();
    const selectTopic = (topic: string) => {
        navigate({
            pathname: routeConfigs.topicItem.getPath(topic)
        });
    }
    return (
        <React.Fragment>
            <Autocomplete
                label="Search topic or select one from below"
                labelHidden={true}
                size="large"
                options={topicList.map((topic) => ({ id: topic, label: topic }))}
                placeholder="Search topic or select one from below"
                onSelect={(v) => selectTopic(v.id)}
                variation="quiet"
            />
            <Collection type="list" items={topicList} direction="row" wrap="wrap" padding="small">
                {(topic) => <TopicItem key={topic} topic={topic} onClick={() => selectTopic(topic)} />}
            </Collection>
        </React.Fragment>
    );
};

const TopicCard = styled(Card)`
    /* border-radius: var(--amplify-radii-medium); */
    flex-grow: 1;
    background-color: var(--amplify-colors-background-info);
    padding: 0;
    :hover {
        cursor: pointer;
        background-color: var(--amplify-colors-background-secondary);
    }
    text-align: center;
`;

const TopicCardContent = styled(View)`
    padding: var(--amplify-space-small);
    :hover {
        cursor: pointer;
        background-color: var(--amplify-colors-background-secondary);
    }
`;

interface ItemProps {
    topic: string;
    onClick: () => void;
}
const TopicItem: React.FC<ItemProps> = ({ topic, onClick }) => {
    return (
        <TopicCard variation="elevated" onClick={onClick}>
            <TopicCardContent>
                <Text variation="primary" fontSize="1.2em">
                    {topic}
                </Text>
            </TopicCardContent>
        </TopicCard>
    );
};

export default TopicList;
