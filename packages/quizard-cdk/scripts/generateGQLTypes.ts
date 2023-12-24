import path from 'path';
import { generateTypeScriptTypes } from 'graphql-schema-typescript';

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
            AWSJSON: 'unknown',
            AWSPhone: 'string',
            AWSURL: 'string',
            AWSIPAddress: 'string'
        }
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
