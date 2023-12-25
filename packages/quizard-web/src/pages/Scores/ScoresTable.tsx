import { Flex, Table, TableBody, TableCell, TableHead, TableRow } from '@aws-amplify/ui-react';
import QuizLink from '@components/Widgets/QuizLink';
import { routeConfigs } from '@config/routeConfigs';
import { ScoreListItemFragment } from '@gql/graphql';
import React from 'react';

interface Props {
    items: ScoreListItemFragment[];
    showQuizColumn: boolean;
    showUserColumn: boolean;
}
const ScoresTable: React.FC<Props> = ({ items, showQuizColumn, showUserColumn }) => {
    return (
        <Table caption="" highlightOnHover={false}>
            <TableHead backgroundColor="background.quaternary">
                <TableRow>
                    {!!showUserColumn && <TableCell as="th">User</TableCell>}
                    {!!showQuizColumn && <TableCell as="th">Topic</TableCell>}
                    <TableCell as="th">Score</TableCell>
                    <TableCell as="th">Time</TableCell>
                </TableRow>
            </TableHead>
            <TableBody backgroundColor="background.secondary">
                {items.map((row, index) => {
                    return (
                        <ScoresTableRow
                            key={index}
                            data={row}
                            showQuizColumn={showQuizColumn}
                            showUserColumn={showUserColumn}
                        />
                    );
                })}
            </TableBody>
        </Table>
    );
};

// score table could grow with many items => use React.memo to avoid re-render on existing rows
interface RowProps {
    data: ScoreListItemFragment;
    showQuizColumn: boolean;
    showUserColumn: boolean;
}
const ScoresTableRow: React.FC<RowProps> = React.memo(
    ({ data, showQuizColumn, showUserColumn }) => {
        return (
            <TableRow>
                {!!showUserColumn && (
                    <TableCell as="th" title={data.username}>
                        {data.userNickname}
                    </TableCell>
                )}
                {!!showQuizColumn && (
                    <TableCell as="th">
                        <Flex>
                            <QuizLink
                                to={{
                                    pathname: routeConfigs.scores.getPath(data.quizCode),
                                }}
                                children={data.quizCode}
                            />
                        </Flex>
                    </TableCell>
                )}
                <TableCell as="th">
                    {data.nCorrect}/{data.nQuestions}
                </TableCell>
                <TableCell as="th" title={data.createdAt}>
                    {new Intl.DateTimeFormat('en-GB').format(new Date(data.createdAt))}
                </TableCell>
            </TableRow>
        );
    },
    (props1, props2) => {
        const getPropsId = (props: RowProps): string => {
            const { userNickname, username, createdAt, quizCode } = props.data;
            return [userNickname, username, createdAt, quizCode, props.showQuizColumn, props.showUserColumn].join('|');
        };
        return getPropsId(props1) === getPropsId(props2);
    },
);

export default ScoresTable;
