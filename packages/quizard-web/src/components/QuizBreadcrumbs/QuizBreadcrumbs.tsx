import { Breadcrumbs } from '@aws-amplify/ui-react';
import { routeConfigs } from '@pages/routeConfig';
import React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import styled from 'styled-components';
import { create } from 'zustand';

//#region ---------- ZUSTAND STORE ----------
type BreadcrumbsStore = {
    breadcrumbs: BreadcrumbsItem[];
    setBreadcrumbs: (config: BreadcrumbsConfig) => void;
};

type BreadcrumbsItem = {
    href: string;
    label: React.ReactNode;
};

type BreadcrumbsConfig = HomeBreadcrumbs | TopicBreadcrumbs | QuizBreadcrumbs | ScoreBreadcrumbs;
type HomeBreadcrumbs = {
    type: 'home';
};
type TopicBreadcrumbs = {
    type: 'topic';
    topic: string;
};
type QuizBreadcrumbs = {
    type: 'quiz';
    topic: string;
    quizId: string;
    quizTitle: string;
};
type ScoreBreadcrumbs = {
    type: 'score';
    quizId: string;
};

const getBaseBreadcrumbsItems = (): BreadcrumbsItem[] => {
    return [{ href: routeConfigs.home.getPath(), label: 'Home' }];
};

const useBreadcrumbsStore = create<BreadcrumbsStore>((set) => ({
    breadcrumbs: getBaseBreadcrumbsItems(),
    setBreadcrumbs: (config) => {
        const items = getBaseBreadcrumbsItems();
        const addTopicBreadcrumbs = (topic: string) => {
            items.push({
                href: routeConfigs.topicItem.getPath(topic),
                label: topic,
            });
        };
        const addQuizBreadcrumbs = (quizId: string, quizTitle: string) => {
            items.push({
                href: routeConfigs.quizItem.getPath(quizId),
                label: quizTitle,
            });
        };
        switch (config.type) {
            case 'home': {
                break;
            }
            case 'quiz': {
                addTopicBreadcrumbs(config.topic);
                addQuizBreadcrumbs(config.quizId, config.quizTitle);
                break;
            }
            case 'topic': {
                addTopicBreadcrumbs(config.topic);
                break;
            }
            case 'score': {
                items.push({
                    href: routeConfigs.scores.getPath(config.quizId),
                    label: 'Scores',
                });
                break;
            }
        }
        set({ breadcrumbs: items });
    },
}));

const useBreadcrumbsItems = () => useBreadcrumbsStore((state) => state.breadcrumbs);
const useSetBreadcrumbs = () => useBreadcrumbsStore((state) => state.setBreadcrumbs);
export const useSetBreadcrumbsOnMount = (config: BreadcrumbsConfig) => {
    const setBreadcrumbs = useSetBreadcrumbs();
    React.useEffect(() => {
        setBreadcrumbs(config);
    }, []);
};
//#endregion

// React router link supports client-side routing so it's better for SPA
// Another approach could be wrapping amplify Breadcrumbs.Link
// and intercept their nav behaviour to support client-side routing
const QuizBreadcrumbsLink = styled(ReactRouterLink)<{ isCurrent?: boolean }>`
    color: ${(props) => props.theme.tokens?.components?.breadcrumbs?.link?.color?.toString()};
    text-decoration: none;
    :visited {
        color: ${(props) => props.theme.tokens?.components?.breadcrumbs?.link?.color?.toString()};
        text-decoration: none;
    }
`;

const QuizBreadcrumbs: React.FC = () => {
    const items = useBreadcrumbsItems();
    return (
        <Breadcrumbs.Container>
            {items.map((item, index) => {
                return (
                    <Breadcrumbs.Item key={index}>
                        {index > 0 && <Breadcrumbs.Separator />}
                        <QuizBreadcrumbsLink
                            to={{
                                pathname: item.href,
                            }}
                            children={item.label}
                        />
                    </Breadcrumbs.Item>
                );
            })}
        </Breadcrumbs.Container>
    );
};

export default QuizBreadcrumbs;
