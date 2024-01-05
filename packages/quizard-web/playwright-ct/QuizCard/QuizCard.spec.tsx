import { test, expect } from '@playwright/experimental-ct-react';
import { QuizCard, QuizCardContent, QuizCardText } from '@components/Widgets/QuizCard';

test('Hello world card', async ({ mount }) => {
    const component = await mount(
        <QuizCard>
            <QuizCardContent>
                <QuizCardText>Hello world</QuizCardText>
            </QuizCardContent>
        </QuizCard>,
    );
    
    expect(await component.screenshot()).toMatchSnapshot({
        name: 'Hello_world.png'
    });
});
