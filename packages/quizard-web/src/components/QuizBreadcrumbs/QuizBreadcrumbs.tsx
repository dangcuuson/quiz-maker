import { Breadcrumbs } from '@aws-amplify/ui-react';
import { routeConfigs } from '@pages/routeConfig';
import React from 'react';
import { Link as ReactRouterLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';

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
    const { pathname } = useLocation();
    const uriComponents = pathname.split('/').filter((v) => !!v);
    const breadcrumbsConfig = uriComponents.map((uri, index) => {
        const label = decodeURIComponent(uri);
        const pathname = uriComponents.slice(0, index + 1).join('/');
        return { label, pathname };
    });
    return (
        <Breadcrumbs.Container>
            <Breadcrumbs.Item>
                <QuizBreadcrumbsLink
                    to={{
                        pathname: routeConfigs.home.getPath(),
                    }}
                    children={'Home'}
                />
            </Breadcrumbs.Item>
            {breadcrumbsConfig.map((config, index) => {
                return (
                    <Breadcrumbs.Item key={index}>
                        <Breadcrumbs.Separator />
                        <QuizBreadcrumbsLink
                            to={{
                                pathname: config.pathname,
                            }}
                            children={config.label}
                        />
                    </Breadcrumbs.Item>
                );
            })}
        </Breadcrumbs.Container>
    );
};

export default QuizBreadcrumbs;
