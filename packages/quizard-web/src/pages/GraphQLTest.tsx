import React from 'react';

import { generateClient } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import {  } from '@apollo/client';
const client = generateClient();


interface Props { }
const GraphQLTest: React.FC<Props> = () => {
    return (
        <Inner />
    );
}

const Inner: React.FC<Props> = () => {
    React.useEffect(
        () => {
            fetchAuthSession({ forceRefresh: true }).then(data => {
                const dc = `
                query MyQ{ 
                    testLambda(value: "ABC")
                }`;

                client.graphql({ query: dc, authToken: `Bearer ${data.tokens?.accessToken.toString()}` }).then((res) => {
                    console.log('>>>OK', res);
                }).catch(err => {
                    console.error('>>ERR', err);
                })
            })
        },
        []
    )
    return <div>Test</div>;
    // // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    // const { data, error, loading } = useQuery(gql`query MyQ{
    //     quizList(topic: "Maths") {
    //       quizId
    //       topic
    //       # title
    //     }
    //   }`);

    // if (loading) {
    //     return <div>Loading</div>
    // }
    // if (error) {
    //     return <div>{JSON.stringify(error, null, 2)}</div>
    // }

    // if (!data) {
    //     return <div>No data</div>
    // }
    // return (
    //     <div>{JSON.stringify(data, null, 2)}</div>
    // )
};

export default GraphQLTest;