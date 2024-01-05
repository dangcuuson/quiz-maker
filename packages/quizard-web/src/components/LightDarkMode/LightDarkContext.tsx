import React from 'react';
import { ThemeProvider, createTheme } from '@aws-amplify/ui-react';
import { useLocalStorage } from '@hooks/hooks';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import '@aws-amplify/ui-react/styles.css';
import './LightDarkContext.css';

type LightDarkContextType = {
    isDarkMode: boolean;
    setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

const MyTheme = createTheme({
    name: 'my-theme',
    tokens: {
        colors: {
            background: {
                primary: { value: '{colors.teal.10}' },
                secondary: { value: '{colors.blue.10}' },
            },
        },
        components: {
            card: {
                backgroundColor: { value: '{colors.teal.20}' },
            }
        }
    },
    primaryColor: 'teal',
    secondaryColor: 'neutral'
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
            <ThemeProvider theme={MyTheme} colorMode={isDarkMode ? 'dark' : 'light'}>
                <StyledThemeProvider theme={MyTheme}>{props.children}</StyledThemeProvider>
            </ThemeProvider>
        </LightDarkContext.Provider>
    );
};
