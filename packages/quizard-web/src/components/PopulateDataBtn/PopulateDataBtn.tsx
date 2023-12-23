import React from 'react';
import { gql } from '../../gql';
import { Button } from '@aws-amplify/ui-react';
import ApolloMutationWrapper from '../ApolloWrapper/ApolloMutationWrapper';

const populateQuizMutation = gql(/* GraphQL */ `
    mutation populateQuizData {
        populateQuizData
    }
`);

interface Props {
    onCompleted: () => void;
}
const PopulateDataBtn: React.FC<Props> = ({ onCompleted }) => {
    return (
        <ApolloMutationWrapper
            mutation={populateQuizMutation}
            onCompleted={onCompleted}
            getSuccessMessage={() => 'Quiz data populated'}
        >
            {(mutate, mutateState) => {
                return (
                    <Button
                        variation="primary"
                        children="Populate quiz data"
                        onClick={() => mutate()}
                        disabled={mutateState.loading}
                    />
                );
            }}
        </ApolloMutationWrapper>
    );
};

export default PopulateDataBtn;
