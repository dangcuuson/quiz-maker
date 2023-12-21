export { }

declare global {
    namespace NodeJS {
        interface ProcessEnvExtends {
            NODE_ENV: 'test' | 'development' | 'release' | 'production';

            // front-end env
            REACT_APP_ENV: 'test' | 'development' | 'release' | 'production';

            // lambda env
            USERS_TABLE: string;
        }
        interface ProcessEnv extends ProcessEnvExtends {
        }
    }
}