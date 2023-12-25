import { Link as ReactRouterLink } from 'react-router-dom';
import styled from 'styled-components';

// React router link supports client-side routing so it's better for SPA
// Another approach could be wrapping amplify Breadcrumbs.Link
// and intercept their nav behaviour to support client-side routing
const QuizLink = styled(ReactRouterLink)<{ isCurrent?: boolean }>`
    color: ${(props) => props.theme.tokens.components.breadcrumbs.link.color.value};
    text-decoration: none;
`;

export default QuizLink;