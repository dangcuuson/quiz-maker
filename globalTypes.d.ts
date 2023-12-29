export { }

declare global {

    // CfnOutput doesn't accept _ so we need to maintain
    // keys of CDKOutputJSON and ViteEnvExtension manually
    interface CDKOutputJSON {
        region: string;
        userPoolId: string;
        userPoolClientId: string;
        GraphQLAPIURL: string;
        // GraphQLAPIID: string;
        // GraphQLAPIKey: string;
    }

    interface ViteEnvExtension {
        VITE_userPoolId: string;
        VITE_userPoolClientId: string;
        VITE_GraphQLAPIURL: string;
        // VITE_GraphQLAPIID: string;
        // VITE_GraphQLAPIKey: string;
    }

    namespace NodeJS {
        interface ProcessEnvExtension {
        }
        interface ProcessEnv extends ProcessEnvExtension {
        }
    }

    interface ImportMetaEnv extends ViteEnvExtension {
    }
}