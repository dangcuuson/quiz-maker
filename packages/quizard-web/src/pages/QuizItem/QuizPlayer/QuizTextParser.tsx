import React from 'react';
import { Text, Image } from '@aws-amplify/ui-react';
import styled from 'styled-components';

const SvgImgPatternRegex = /\d{4}-\w+-q\d+.*?\.svg/;
type Replacer<T> = (match: string) => T;
/**
 * Grep a string using regex, and replace matched parts by anything returned from replacer
 */
function stringReplaceToArray<T>(data: string, regexp: RegExp, replacer: Replacer<T>): (T | string)[] {
    const output: (T | string)[] = [];

    let result: RegExpExecArray | null = null;
    let lastIndex = regexp.lastIndex;
    let counter = 0;
    while ((result = regexp.exec(data))) {
        counter++;
        if (counter > 100) {
            // safety net to avoid infinite loop
            break;
        }

        if (result.index > lastIndex) {
            output.push(data.substring(lastIndex, result.index));
        }

        const match = result[0];
        lastIndex = result.index + match.length;

        const out = replacer(match);
        output.push(out);

        if (!regexp.global) {
            break;
        }
    }

    if (lastIndex < data.length) {
        output.push(data.substring(lastIndex));
    }

    return output;
}

const QImg = styled(Image)`
    min-width: 360px;
    max-width: 600px;
    background-color: ${props => props.theme.tokens.colors.background.info};
`;

interface Props {
    text: string;
}
const QuizTextParser: React.FC<Props> = ({ text }) => {
    const parts = React.useMemo(() => {
        return stringReplaceToArray(text, SvgImgPatternRegex, (svgImgFile) => {
            return <QImg alt="" src={`https://quiz.nesa.nsw.edu.au/assets/mcq-images/${svgImgFile}`} />;
        });
    }, [text]);
    return (
        <React.Fragment>
            {parts.map((part, index) => {
                if (typeof part === 'string') {
                    return <Text key={index}>{part}</Text>;
                }
                return <React.Fragment key={index}>{part}</React.Fragment>;
            })}
        </React.Fragment>
    );
};

export default QuizTextParser;
