export { }

declare global {

    // CfnOutput doesn't accept _ so we need to maintain
    // keys of CDKOutputJSON and ViteEndExtension manually
    interface CDKOutputJSON {
        userPoolId: string;
        userPoolClientId: string;
    }

    interface ViteEndExtension {
        VITE_branch: string;
        VITE_userPoolId: string;
        VITE_userPoolClientId: string;
    }

    namespace NodeJS {
        interface ProcessEnvExtension {
        }
        interface ProcessEnv extends ProcessEnvExtension {
        }
    }

    interface ImportMetaEnv extends ViteEndExtension {
    }
}