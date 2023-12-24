import React from 'react';
import { gql } from '@gql/index';
import { Button } from '@aws-amplify/ui-react';
import ApolloMutationWrapper from '@components/ApolloWrapper/ApolloMutationWrapper';

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
                        children={mutateState.loading ? 'Please wait. This may takes a while' : 'Populate quiz dat '}
                        onClick={() => mutate()}
                        disabled={mutateState.loading}
                    />
                );
            }}
        </ApolloMutationWrapper>
    );
};

export default PopulateDataBtn;
