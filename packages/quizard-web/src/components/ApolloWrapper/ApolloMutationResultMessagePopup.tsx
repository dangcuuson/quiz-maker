import { Message, MessageColorTheme, View } from '@aws-amplify/ui-react';
import React from 'react';
import { create } from 'zustand';

type MessageStore = {
    message: MessageData | null;
    setMessage: (message: MessageData | null) => void;
};

type MessageData = {
    color: MessageColorTheme;
    content: string;
};

const useMessageStore = create<MessageStore>((set) => ({
    message: null,
    setMessage: (message: MessageData | null) => set({ message }),
}));

export const useSetMessage = () => useMessageStore((state) => state.setMessage);
export const useMessage = () => useMessageStore((state) => state.message);

// TODO: implement message queue

interface Props {}
const ApolloMutationResultMessagePopup: React.FC<Props> = () => {
    const message = useMessage();
    const setMessage = useSetMessage();

    // auto clear message after a certain time
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setMessage(null);
        }, 5000);
        return () => {
            clearInterval(handler);
        };
    }, [message]);

    if (!message) {
        return null;
    }

    return (
        <View position="fixed" left="50%" transform="translateX(-50%)" borderRadius="5">
            <Message
                colorTheme={message.color}
                heading={message.content}
                onDismiss={() => setMessage(null)}
                isDismissible={true}
            />
        </View>
    );
};

export default ApolloMutationResultMessagePopup;
