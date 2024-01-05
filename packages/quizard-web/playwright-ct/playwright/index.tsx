import { beforeMount } from '@playwright/experimental-ct-react/hooks';
import { LightDarkContextThemeProvider } from '@components/LightDarkMode/LightDarkContext';

type HooksConfig = object;

// eslint-disable-next-line @typescript-eslint/require-await
beforeMount<HooksConfig>(async ({ App }) => {
    return (
        <LightDarkContextThemeProvider>
            <App />
        </LightDarkContextThemeProvider>
    );
});

// afterMount<HooksConfig>(async () => {
//     console.log(`After mount`);
// });
