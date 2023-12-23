import _ from 'lodash';
import React from 'react';
import { RouteProps } from 'react-router-dom';

const HomePage = React.lazy(() => import('@pages/Home/HomePage'));

export interface RouteItemConfig<TGet extends Function = Function> {
    props: RouteProps;
    get: TGet;
}

const createRouteItemConfig = <TGet extends Function>(config: RouteItemConfig<TGet>): RouteItemConfig<TGet> => {
    return config;
};

export const routeConfigs = {
    home: createRouteItemConfig({
        get: () => '/',
        props: { path: '/', element: <HomePage /> }
    }),
    // quiz: createRouteItemConfig({
    //     get: (id: string) => `/quiz/${encodeURIComponent(id)}`,
    //     props: { path: '/quiz/:quizId', element: <QuizPage /> }
    // }),
}