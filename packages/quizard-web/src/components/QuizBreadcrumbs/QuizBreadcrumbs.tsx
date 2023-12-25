import { Breadcrumbs } from '@aws-amplify/ui-react';
import QuizLink from '@components/Widgets/QuizLink';
import { routeConfigs } from '@config/routeConfigs';
import React from 'react';
import { useLocation } from 'react-router-dom';

const QuizBreadcrumbs: React.FC = () => {
    const { pathname } = useLocation();
    
    const baseUrl = import.meta.env.BASE_URL;
    const uriComponents = pathname.replace(baseUrl, '').split('/').filter((v) => !!v);
    const breadcrumbsConfig = uriComponents.map((uri, index) => {
        const label = decodeURIComponent(uri);
        const pathname = baseUrl + uriComponents.slice(0, index + 1).join('/');
        return { label, pathname };
    });
    return (
        <Breadcrumbs.Container>
            <Breadcrumbs.Item>
                <QuizLink
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
                        <QuizLink
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
