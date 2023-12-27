import React from 'react';
import { useNavigate } from 'react-router-dom';
import { routeConfigs } from '@config/routeConfigs';
import { Button, Flex, View, Text, useTheme } from '@aws-amplify/ui-react';
import ErrorBoundary from '@components/ErrorBoundary/ErrorBoundary';
import QuizBreadcrumbs from '@components/QuizBreadcrumbs/QuizBreadcrumbs';
import UserMenu from '@components/UserMenu/UserMenu';
import { FaWandMagicSparkles } from 'react-icons/fa6';

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
                        <Flex display="flex" flex="1" justifyContent="flex-start" alignItems="center">
                            <Button
                                size="large"
                                gap={'relative.small'}
                                variation="link"
                                onClick={() => navigate(routeConfigs.home.getPath())}
                            >
                                <FaWandMagicSparkles />
                                <Text>Quizard</Text>
                            </Button>
                            <UserMenu />
                            {/* <NightModeToggle /> */}
                        </Flex>
                        <View padding="relative.medium" width="100%">
                            <QuizBreadcrumbs />
                            <ErrorBoundary>
                                <View padding="relative.small">{children}</View>
                            </ErrorBoundary>
                        </View>
                    </React.Suspense>
                </View>
            </View>
        </ErrorBoundary>
    );
};

export default MainLayout;
