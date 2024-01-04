import { execSync } from 'child_process';
import { readCDKOutputsJSON } from '../../scripts/readCDKOutputsJson';
import { test, expect } from '@playwright/test';

export const TEST_USER = {
    username: 'test@example.com',
    password: 'Quizard-1',
    nickname: 'Test User',
};

test('setup test user', async ({ page }) => {
    const { userPoolId } = await readCDKOutputsJSON();
    try {
        const deleteUserCommand = `aws cognito-idp admin-delete-user \
                                    --user-pool-id ${userPoolId} \
                                    --username ${TEST_USER.username}`;
        execSync(deleteUserCommand);
    } catch {
        //
    }

    // Create user
    const createUserCommand = `aws cognito-idp admin-create-user \
                              --user-pool-id ${userPoolId} \
                              --username ${TEST_USER.username} \
                              --user-attributes Name=nickname,Value="${TEST_USER.nickname}" \
                              --message-action SUPPRESS`; // SUPRESS so that aws does not send activation message
    execSync(createUserCommand);

    // set password
    const setPasswordCommand = `aws cognito-idp admin-set-user-password \
                                --user-pool-id ${userPoolId} \
                                --username ${TEST_USER.username} \
                                --password ${TEST_USER.password} \
                                --permanent`;
    execSync(setPasswordCommand);

    // verify email
    const verifyEmailCommand = `aws cognito-idp admin-update-user-attributes \
                                --user-pool-id ${userPoolId} \
                                --username ${TEST_USER.username} \
                                --user-attributes Name=email_verified,Value=true`;
    execSync(verifyEmailCommand);

    await page.goto('/');
    await expect(page).toHaveScreenshot('loginscreen.png');

    await page.locator("input[name='username']").fill(TEST_USER.username);
    await page.locator("input[name='password']").fill(TEST_USER.password);

    await page.locator('button[type="submit"]').click();

    await expect(page.getByTestId('main-layout')).toBeInViewport();
});
