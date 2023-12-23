import React from 'react';
import { useNavigate } from 'react-router-dom';
import { routeConfigs } from './routeConfig';
import { Button, Flex, View, useTheme } from '@aws-amplify/ui-react';
import ErrorBoundary from '@components/ErrorBoundary/ErrorBoundary';

const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    return (
        <ErrorBoundary>
            <View backgroundColor="background.secondary" padding={0}>
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
                                onClick={() => navigate(routeConfigs.home.get())}
                                children={"Quizard"}
                            />
                            {/* <DayNightMusicPlayer /> */}
                            {/* <NightModeToggle /> */}
                        </Flex>
                        <View padding={2} width="100%">
                            {children}
                        </View>
                    </React.Suspense>
                </View>
            </View>
        </ErrorBoundary>
    );
};

export default MainLayout;
