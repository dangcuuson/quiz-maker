import { Alert } from '@aws-amplify/ui-react';
import React from 'react';

interface Props {
    onRetry?: () => void;
    children?: React.ReactNode;
}

interface State {
    error: string;
}

export default class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { error: '' };
    }

    static getDerivedStateFromError(error: unknown) {
        return { error: error + '' };
    }

    componentDidCatch(err: unknown, errInfo: React.ErrorInfo) {
        console.error(err);
        console.log(errInfo);
    }

    closeError = (callback: () => void) => () => this.setState({ error: '' }, () => callback);

    render() {
        const errorMessage = import.meta.env.PROD ? 'An error occured when rendering' : this.state.error;
        if (this.state.error) {
            return (
                <Alert
                    variation="error"
                    hasIcon={true}
                    heading={errorMessage}
                    isDismissible={true}
                    onDismiss={this.props.onRetry}
                />
            );
        }

        return this.props.children || null;
    }
}
