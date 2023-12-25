import React from 'react';
import { RouteProps } from 'react-router-dom';

const HomePage = React.lazy(() => import('@pages/Home/HomePage'));
const QuizList = React.lazy(() => import('@pages/QuizList/QuizListPage'));
const QuizItemPage = React.lazy(() => import('@pages/QuizItem/QuizItemPage'));
const ScoresPage = React.lazy(() => import('@pages/Scores/ScoresPages'));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TGetFunc = (...args: any[]) => string;
export interface RouteItemConfig<TGet extends TGetFunc = TGetFunc> {
    props: RouteProps;
    getPath: TGet;
}

const createRouteItemConfig = <TGet extends TGetFunc>(config: RouteItemConfig<TGet>): RouteItemConfig<TGet> => {
    return config;
};

const baseUrl = import.meta.env.BASE_URL;

export const routeConfigs = {
    home: createRouteItemConfig({
        getPath: () => baseUrl,
        props: { path: baseUrl, element: <HomePage /> }
    }),
    quizList: createRouteItemConfig({
        getPath: (topic: string) => `${baseUrl}${decodeURIComponent(topic)}`,
        props: { path: `${baseUrl}:topic`, element: <QuizList /> }
    }),
    quizItem: createRouteItemConfig({
        getPath: (topic: string, title: string) => `${baseUrl}${encodeURIComponent(topic)}/${encodeURIComponent(title)}`,
        props: { path: `${baseUrl}:topic/:title`, element: <QuizItemPage /> }
    }),
    myScores: createRouteItemConfig({
        getPath: () => `${baseUrl}Scores`,
        props: { path: `${baseUrl}Scores`, element: <ScoresPage filterMode="user" /> }
    }),
    scores: createRouteItemConfig({
        getPath: (quizCode: string) => `${baseUrl}Scores/${encodeURIComponent(quizCode)}`,
        props: { path: `${baseUrl}Scores/:quizCode`, element: <ScoresPage filterMode="quizCode" /> }
    }),
}