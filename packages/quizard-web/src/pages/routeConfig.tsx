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

// TODO: move this file to @config/routeConfigs
export const routeConfigs = {
    home: createRouteItemConfig({
        getPath: () => '/',
        props: { path: '/', element: <HomePage /> }
    }),
    quizList: createRouteItemConfig({
        getPath: (topic: string) => `/${decodeURIComponent(topic)}`,
        props: { path: '/:topic', element: <QuizList /> }
    }),
    quizItem: createRouteItemConfig({
        getPath: (topic: string, title: string) => `/${encodeURIComponent(topic)}/${encodeURIComponent(title)}`,
        props: { path: '/:topic/:title', element: <QuizItemPage /> }
    }),
    scores: createRouteItemConfig({
        getPath: (quizCode: string) => `/scores/${encodeURIComponent(quizCode)}`,
        props: { path: '/scores/:quizCode', element: <ScoresPage /> }
    }),
}