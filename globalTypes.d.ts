export { }

declare global {

    interface ViteEndExtension {
        VITE_BRANCH: string;
        VITE_Cognito_UserPoolId: string;
        VITE_Cognito_UserPoolClientId: string;
    }
    namespace NodeJS {
        interface ProcessEnvExtension extends ViteEndExtension {
        }
        interface ProcessEnv extends ProcessEnvExtension {
        }
    }

    interface ImportMetaEnv extends ViteEndExtension {
    }
}