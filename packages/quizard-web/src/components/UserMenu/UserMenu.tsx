import React from 'react';
import * as Auth from 'aws-amplify/auth';
import { useEffectOnce } from '@hooks/hooks';
import { Text, Flex, Menu, MenuItem, useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router';
import { routeConfigs } from '@config/routeConfigs';

const UserMenu: React.FC = () => {
    const [displayName, setDisplayName] = React.useState('');
    const navigate = useNavigate();
    const authenticator = useAuthenticator();
    useEffectOnce(() => {
        const fetchDisplayname = async () => {
            const userAttr = await Auth.fetchUserAttributes();
            if (userAttr.nickname) {
                setDisplayName(userAttr.nickname);
            } else {
                const curUser = await Auth.getCurrentUser();
                setDisplayName(curUser.username);
            }
        };

        void fetchDisplayname();
    });
    return (
        <Flex marginLeft="auto" alignItems="center">
            <Text>Hello {displayName}</Text>
            <Menu menuAlign="end">
                <MenuItem
                    onClick={() => {
                        navigate({
                            pathname: routeConfigs.myScores.getPath(),
                        });
                    }}
                >
                    My scores
                </MenuItem>
                <MenuItem onClick={() => authenticator.signOut()}>Sign out</MenuItem>
            </Menu>
        </Flex>
    );
};

export default UserMenu;
