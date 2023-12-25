import path from 'path';
import { generateTypeScriptTypes } from 'graphql-schema-typescript';
import { combineGraphqlFilesIntoSchema } from '../src/stacks/stacksHelper';

const SRC_DIR = path.resolve('src/schema');
const OUTPUT_PATH = path.resolve('src/shared', 'gqlTypes.ts');

generateTypeScriptTypes(
    SRC_DIR,
    OUTPUT_PATH,
    {
        customScalarType: {
            AWSDate: 'string',
            AWSTime: 'string',
            AWSDateTime: 'string',
            AWSTimestamp: 'number',
            AWSEmail: 'string',
            AWSJSON: 'string',
            AWSPhone: 'string',
            AWSURL: 'string',
            AWSIPAddress: 'string',
        },
    },
    {
        assumeValidSDL: true,
        assumeValid: true,
    },
)
    .then(() => console.log(`Types generated at ${OUTPUT_PATH}`))
    .catch((err: unknown) => {
        console.error(err);
        process.exit(1);
    });

// combie into big file for apollo.config.js
combineGraphqlFilesIntoSchema();
