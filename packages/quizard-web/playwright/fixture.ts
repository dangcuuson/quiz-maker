import { test as baseTest, expect, Page, Route } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { readCDKOutputsJSON } from '../scripts/readCDKOutputsJson';
import { execSync } from 'child_process';
import _get from 'lodash/get';

export * from '@playwright/test';

const acquireAccount = async (id: number) => {
    const TEST_USER = {
        username: `test_user_${id}@example.com`,
        password: 'Quizard-1',
        nickname: `Test User`,
    };
    const { userPoolId } = await readCDKOutputsJSON();
    const tryCreateUser = () => {
        try {
            // Create user
            const createUserCommand = `aws cognito-idp admin-create-user \
                                        --user-pool-id ${userPoolId} \
                                        --username ${TEST_USER.username} \
                                        --user-attributes Name=nickname,Value="${TEST_USER.nickname}" \
                                        --message-action SUPPRESS`; // SUPRESS so that aws does not send activation message
            execSync(createUserCommand);
        } catch (err) {
            // may error if user already exists, ignore
        }
    };
    tryCreateUser();

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

    return TEST_USER;
};

export const testWithAuth = baseTest.extend<object, { workerStorageState: string }>({
    // Use the same storage state / contextOptions for all tests in this worker.
    storageState: ({ workerStorageState }, use) => use(workerStorageState),
    // Authenticate once per worker with a worker-scoped fixture.
    workerStorageState: [
        async ({ browser }, use) => {
            // Use parallelIndex as a unique identifier for each worker.
            const id = testWithAuth.info().parallelIndex;
            const fileName = path.resolve(testWithAuth.info().project.outputDir, `.auth/${id}.json`);

            if (fs.existsSync(fileName)) {
                // Reuse existing authentication state if any.
                await use(fileName);
                return;
            }

            // Important: make sure we authenticate in a clean environment by unsetting storage state.
            const page = await browser.newPage({ ...testWithAuth.info().project.use, storageState: undefined });

            // Acquire a unique account, for example create a new one.
            // Alternatively, you can have a list of precreated accounts for testing.
            // Make sure that accounts are unique, so that multiple team members
            // can run tests at the same time without interference.
            const account = await acquireAccount(id);

            // Perform authentication steps..
            await page.goto('/');

            await page.locator("input[name='username']").fill(account.username);
            await page.locator("input[name='password']").fill(account.password);

            await page.locator('button[type="submit"]').click();

            // wait for login to finish
            await expect(page.getByTestId('main-layout')).toBeVisible();
            // End of authentication steps.

            // save authentication state for reuse in other tests.
            await page.context().storageState({ path: fileName });
            await page.close();
            await use(fileName);
        },
        { scope: 'worker' },
    ],
});

// Registers a client-side interception to graphql. Interceptions are per-operation, so multiple can be
// registered for different operations without overwriting one-another.
export async function interceptGQL<TData = unknown, TVariables = unknown>(args: {
    page: Page;
    operationName: string;
    patchResponse?: (data: TData) => TData;
}): Promise<TVariables[]> {
    const { page, operationName, patchResponse } = args;
    // A list of GQL variables which the handler has been called with.
    const reqs: TVariables[] = [];

    // Register a new handler which intercepts all GQL requests.
    await page.route('**/graphql', async function (route: Route) {
        const req: unknown = route.request().postDataJSON();

        // Pass along to the previous handler in the chain if the request
        // is for a different operation.
        if (_get(req, 'operationName') !== operationName) {
            return route.fallback();
        }

        const response = await route.fetch();
        expect(response.status()).toBe(200);
        
        const respJSON: unknown = await response.json();

        // Store what variables we called the API with.
        reqs.push(_get(req, 'variables') as TVariables);

        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: patchResponse ? patchResponse(_get(respJSON, 'data') as TData) : respJSON }),
        });
    });

    return reqs;
}
