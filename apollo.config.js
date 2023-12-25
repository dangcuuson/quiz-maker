module.exports = {
    client: {
      service: {
        localSchemaFile: './packages/quizard-cdk/combined_schema.graphql',
        endpoint: null
      },
      includes: [
        "./packages/quizard-web/src/**/*.{ts,tsx,js,jsx,graphql}"
      ]
    }
  };