import type { CSSProp } from 'styled-components';
import type { WebTheme } from '@aws-amplify/ui';

// connect amplify Theme to styled component themes

declare module 'styled-components' {
    export interface DefaultTheme extends WebTheme {}
}

declare module 'react' {
    interface DOMAttributes {
        css?: CSSProp;
    }
}