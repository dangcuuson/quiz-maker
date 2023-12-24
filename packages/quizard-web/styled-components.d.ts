import type { CSSProp } from "styled-components";
import type { Theme as AmplifyTheme } from '@aws-amplify/ui-react';

// connect amplify Theme to styled component themes

declare module "styled-components" {
 export interface DefaultTheme extends AmplifyTheme {}
}

declare module "react" {
 interface DOMAttributes<T> {
   css?: CSSProp;
 }
}