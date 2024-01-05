import { test, expect } from '@playwright/test';
import { interceptGQL, testWithAuth } from '../fixture';
import { TopicListQuery, TopicListQueryVariables } from '@gql/graphql';

test('should show login page if unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Quizard');
    await expect(page).toHaveScreenshot('loginscreen.png', { fullPage: true });
});

testWithAuth('should show topic list if authenticated', async ({ page }) => {
    // patch server response to make topic list deterministic
    // IMPORTANT: this needs to be called before graphql request is made
    const called = await interceptGQL<TopicListQuery, TopicListQueryVariables>({
        page,
        operationName: 'topicList',
        patchResponse: (resp) => {
            return {
                ...resp,
                topicList: ['Maths', 'English', 'Science', 'Geography', 'History'],
            };
        },
    });

    await page.goto('/');

    // wait for topic list to load before snapshotting
    await expect(page.getByTestId('topic-list-container')).toBeVisible();
    
    // take snapshot
    expect(called).toHaveLength(1);
    await expect(page).toHaveScreenshot('topic-list.png', { fullPage: true });
    // alternatively, can also take snapshot of the container only
    // await expect(page.getByTestId('topic-list-container')).toHaveScreenshot('topiclist.png');
});
