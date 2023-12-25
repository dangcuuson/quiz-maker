import React from 'react';
import { ThemeProvider, createTheme } from '@aws-amplify/ui-react';
import { useLocalStorage } from '@hooks/hooks';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

type LightDarkContextType = {
    isDarkMode: boolean;
    setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

// TODO: design dark theme

const LightTheme = createTheme({
    name: 'light_theme',
    cssText: 'light',
    tokens: {
        colors: {
            background: {
                primary: { value: '{colors.teal.10}' },
                secondary: { value: '{colors.blue.20}' },
            },
        },
    },
});

export const LightDarkContext = React.createContext<LightDarkContextType>({
    isDarkMode: false,
    setIsDarkMode: () => null,
});

export const LightDarkContextThemeProvider: React.FC<{ children: React.ReactNode }> = (props) => {
    // const prefersDarkMode: boolean = useMediaQuery('(prefers-color-scheme: dark)');

    const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>({
        key: 'dark_mode',
        getInitValue: (v) => {
            // if (!v) {
            //     return prefersDarkMode;
            // }
            return v === 'true';
        },
    });

    return (
        <LightDarkContext.Provider
            value={{
                isDarkMode,
                setIsDarkMode,
            }}
        >
            <ThemeProvider theme={LightTheme} colorMode={isDarkMode ? 'dark' : 'light'}>
                <StyledThemeProvider theme={LightTheme}>{props.children}</StyledThemeProvider>
            </ThemeProvider>
        </LightDarkContext.Provider>
    );
};
