import React from 'react';
import { useNavigate } from 'react-router-dom';
import { routeConfigs } from './routeConfig';
import { Button, Flex, View, useTheme } from '@aws-amplify/ui-react';
import ErrorBoundary from '@components/ErrorBoundary/ErrorBoundary';
import QuizBreadcrumbs from '@components/QuizBreadcrumbs/QuizBreadcrumbs';

const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    return (
        <ErrorBoundary>
            <View backgroundColor="background.secondary">
                <View
                    margin="auto"
                    boxShadow="large"
                    backgroundColor="background.primary"
                    minHeight="100vh"
                    width="100%"
                    maxWidth={theme.breakpoints.values.large}
                    overflow="auto"
                    padding="medium"
                >
                    <React.Suspense fallback="Loading...">
                        <Flex display="flex" flex="1" justifyContent="flex-start">
                            <Button
                                size="large"
                                variation="link"
                                onClick={() => navigate(routeConfigs.home.getPath())}
                                children={'Quizard'}
                            />
                            {/* <NightModeToggle /> */}
                        </Flex>
                        <View padding="relative.medium" width="100%">
                            <QuizBreadcrumbs />
                            <View padding="relative.small">{children}</View>
                        </View>
                    </React.Suspense>
                </View>
            </View>
        </ErrorBoundary>
    );
};

export default MainLayout;
