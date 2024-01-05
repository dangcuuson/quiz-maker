import { test, expect } from '@playwright/test';
import { interceptGQL, testWithAuth } from '../fixture';
import { TopicListQuery, TopicListQueryVariables } from '@gql/graphql';
import { BASE_URL } from '../playwright.config';

test('should show login page if unauthenticated', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle('Quizard');
    await expect(page).toHaveScreenshot('loginscreen.png', { fullPage: true });
});

testWithAuth('should show topic list if authenticated', async ({ page }) => {
    await page.goto(BASE_URL);

    // wait for topic list to load before snapshotting
    await expect(page.getByTestId('topic-list-container')).toBeInViewport();

    // patch server response to make topic list deterministic
    await interceptGQL<TopicListQuery, TopicListQueryVariables>({
        page,
        operationName: 'topicList',
        patchResponse: resp => {
          console.log('>>>RESP', resp);
          return {
            ...resp,
            topicList: ['Maths', 'English', 'Science', 'Geography', 'History']
          }
        }
    });
    await page.route('*/**/api/v1/fruits', async (route) => {
        const response = await route.fetch();
        const json: unknown = await response.json();

        await route.fulfill({ response, json });
    });

    // take snapshot
    await expect(page).toHaveScreenshot('topic-list.png', { fullPage: true });
    // alternatively, can also take snapshot of the container only
    // await expect(page.getByTestId('topic-list-container')).toHaveScreenshot('topiclist.png');
});
